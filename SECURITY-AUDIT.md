# Audit de sécurité — GabonPrice

**Date** : 2026-07-11
**Périmètre** : `frontend/` (Vite/React/TypeScript, PWA) + projet Supabase `Gabon_price` (`vgczurwskvwmbyhstwku`, eu-west-3) — pas de backend applicatif séparé, pas d'Edge Functions.
**Méthode** : lecture du code source, requêtes SQL directes sur le catalogue Postgres (`pg_policies`, `pg_proc`, `information_schema.column_privileges`, `pg_constraint`), logs Auth des dernières 24h, `npm audit`, tests de headers HTTP en production (`curl`).
**Aucune modification de code n'a été effectuée.**

## Résumé exécutif

Le projet part d'une base solide : RLS activée partout, aucune clé secrète exposée, aucune injection SQL/XSS trouvée, `npm audit` propre, authentification 100 % déléguée à Supabase Auth (pas de logique OTP maison). Un incident de sécurité critique (escalade de privilèges via GRANT trop larges) avait déjà été identifié et corrigé lors d'une session précédente (2026-07-09) — cet audit a spécifiquement revérifié que ce pattern n'était pas revenu, et a trouvé des **résidus du même problème côté rôle `anon`**, actuellement neutralisés par les policies RLS mais fragiles.

Aucune vulnérabilité **Critique** directement exploitable n'a été trouvée aujourd'hui. Les points **Élevé/Moyen** ci-dessous sont soit des violations du principe du moindre privilège (défense en profondeur), soit des lacunes concrètes (upload, headers, hygiène de session) qui méritent correction avant une ouverture publique plus large.

---

## 🔴 Élevé

### E1 — GRANTs colonne par colonne excessivement larges accordés au rôle `anon` — ✅ CORRIGÉ (2026-07-11)

> Migration `restrict_anon_write_grants` appliquée : `REVOKE INSERT, UPDATE ... FROM anon` sur les 6 tables, et les policies `prices_insert_own`/`price_ratings_insert_own`/`price_reports_insert_own` restreintes au rôle `authenticated` (`ALTER POLICY ... TO authenticated`). Vérifié : un utilisateur authentifié peut toujours insérer un prix (test en transaction annulée), une tentative d'insertion en rôle `anon` échoue désormais avec `permission denied for table prices` (refus explicite au niveau GRANT, plus une dépendance implicite à `auth.uid() IS NULL`), et la lecture publique des prix actifs (`anon`) reste intacte (29 lignes visibles).

- **Où** : base Supabase, tables `prices`, `price_ratings`, `price_reports`, `products`, `users`, `price_history` (GRANTs, pas de fichier de code — probablement hérités du comportement par défaut de Supabase à la création des tables).
- **Risque** : le rôle `anon` (utilisateur non authentifié) possède des GRANTs `INSERT`/`UPDATE` sur la quasi-totalité des colonnes de ces tables, y compris des colonnes sensibles (`is_admin`, `is_banned`, `email` sur `users` ; `status`, `helpful_votes` sur `prices`). **Actuellement non exploitable** car :
  - Pour `products`, `price_history`, `users` (INSERT) : aucune policy RLS ne s'applique au rôle `anon` pour ces commandes → refus par défaut de RLS.
  - Pour `prices`, `price_ratings`, `price_reports` (INSERT) : la policy s'applique au rôle `public` (donc `anon` inclus), mais le `WITH CHECK` exige `user_id = auth.uid()` ; pour une requête anonyme `auth.uid()` vaut `NULL`, et `user_id = NULL` n'est jamais vrai en SQL → l'insertion échoue.
  - Ce comportement sûr dépend donc d'une sémantique SQL implicite (comparaison à `NULL`), pas d'un refus explicite. C'est exactement la classe de bug qui a causé l'incident critique du 2026-07-09 dans ce même projet ("RLS ne restreint que les lignes, pas les colonnes ; un GRANT trop large + une policy future légèrement modifiée peut rouvrir une escalade de privilèges").
- **Scénario d'exploitation** (si une policy était modifiée par erreur demain, par ex. un `WITH CHECK` élargi ou une policy `USING (true)` ajoutée sans y penser) : un attaquant non authentifié pourrait insérer/modifier des lignes arbitraires, y compris s'auto-attribuer un statut admin sur un compte qu'il contrôle via un autre chemin, ou falsifier des votes/prix.
- **Correctif recommandé** :
  ```sql
  revoke insert, update on public.prices, public.price_ratings, public.price_reports,
    public.products, public.users, public.price_history from anon;
  -- Ne laisser à anon que le SELECT nécessaire (déjà correctement scopé par colonne
  -- pour `users`, à vérifier/reproduire pour les autres tables si un accès anonyme
  -- en lecture est voulu).
  ```
  Puis restreindre les `roles` des policies INSERT de `prices_insert_own`, `price_ratings_insert_own`, `price_reports_insert_own` à `authenticated` uniquement (actuellement `{public}`), pour que la policy elle-même documente l'intention au lieu de compter sur `auth.uid() IS NULL`.

---

## 🟠 Moyen

### M1 — Bucket Storage `price-photos` sans limite serveur de taille ni de type MIME — ✅ CORRIGÉ (2026-07-11)

> Bucket reconfiguré : `file_size_limit = 300000` (300 Ko), `allowed_mime_types = ['image/jpeg','image/png','image/webp']`. Le flux normal de l'app (compression client, toujours < 200 Ko en `image/jpeg`) reste inchangé ; tout appel direct à l'API Storage hors app avec un fichier trop volumineux ou d'un type non listé est désormais rejeté nativement par Supabase Storage avant même d'atteindre les policies RLS.

- **Où** : Supabase Storage, bucket `price-photos` (`public=true`, `file_size_limit=null`, `allowed_mime_types=null`) ; `frontend/src/lib/photo.ts:12-38` (compression uniquement côté client, canvas → JPEG < 200 Ko).
- **Risque** : la policy RLS `price_photos_insert_own` (`storage.objects`, `WITH CHECK bucket_id='price-photos' AND foldername[1]=auth.uid()`) limite bien l'écriture au dossier de l'utilisateur authentifié, mais **rien ne contraint la taille ou le type du fichier côté serveur**. Le flux normal de l'app réencode toujours l'image en JPEG plat (donc sûr par construction), mais un utilisateur authentifié peut appeler directement l'API Storage (hors app, ex. `curl` avec son propre JWT) pour uploader un fichier arbitraire (taille illimitée, `Content-Type` arbitraire) dans son propre dossier.
- **Scénario** : upload de fichiers volumineux (abus de quota/coût) ou d'un fichier HTML/SVG avec `Content-Type: text/html`/`image/svg+xml` contenant du script. Le bucket étant public, l'URL générée sert ce contenu tel quel. Impact limité par l'isolation d'origine (le contenu serait servi depuis `*.supabase.co`, pas depuis le domaine de l'app, donc pas de vol direct de session GabonPrice), mais reste un vecteur d'hébergement de contenu malveillant/de phishing sous un sous-domaine de confiance.
- **Correctif recommandé** : configurer nativement le bucket —
  ```sql
  update storage.buckets
  set file_size_limit = 300000, -- ~300 Ko, marge sur les 200 Ko ciblés côté client
      allowed_mime_types = array['image/jpeg','image/png','image/webp']
  where id = 'price-photos';
  ```

### M2 — Pas de purge du cache local à la déconnexion (fuite de données sur appareil partagé) — ✅ CORRIGÉ (2026-07-11)

> `signOut()` (`frontend/src/lib/profile.ts`) vide désormais `queryClient`, supprime la clé `localStorage` persistée (`gabonprice:query-cache`) et efface les caches Workbox (`supabase-api`, `images`) après la déconnexion Supabase réussie.

- **Où** : `frontend/src/lib/profile.ts:9-12` (`signOut()`), `frontend/src/main.tsx:26-31` (`persistQueryClient`, clé `gabonprice:query-cache`, `maxAge: 24h`), `vite.config.ts:52-64` (cache Workbox `supabase-api`, `maxAgeSeconds: 24h`).
- **Risque** : `signOut()` n'appelle que `supabase.auth.signOut()`, qui nettoie uniquement le jeton de session Supabase. Il ne vide ni le cache TanStack Query persisté en `localStorage`, ni le cache HTTP Workbox. Ces caches contiennent des données de l'utilisateur précédent (profil incluant l'email — cf. `fetchMyProfile`/`get_my_profile()` mis en cache par `useQuery`, historique de contributions, votes). Sur un appareil partagé (PWA installée sur un téléphone familial, ordinateur public), l'utilisateur suivant peut voir apparaître brièvement ces données au chargement, et un accès aux DevTools/`localStorage` du navigateur les expose intégralement pendant 24h.
- **Correctif recommandé** : dans `signOut()`, après `supabase.auth.signOut()`, appeler `queryClient.clear()` et `caches.delete('supabase-api')` (ou `caches.keys()` + suppression complète), et supprimer explicitement la clé `localStorage.removeItem('gabonprice:query-cache')`.

### M3 — En-têtes de sécurité HTTP absents

- **Où** : `frontend/vercel.json` (aucun bloc `headers`) ; confirmé en production via `curl -I https://gabonprice.vercel.app/` — seul `Strict-Transport-Security` est présent (ajouté par défaut par Vercel), aucun `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, ni `Referrer-Policy`.
- **Risque** : pas d'exploitation directe confirmée (aucun XSS trouvé dans le code React, qui échappe par défaut), mais absence de défense en profondeur : pas de protection contre le MIME-sniffing, pas de restriction sur l'intégration en iframe (clickjacking), pas de politique de referrer pour limiter la fuite d'URL vers des sites tiers.
- **Correctif recommandé** : ajouter dans `vercel.json` :
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "geolocation=(self), camera=(), microphone=()" }
        ]
      }
    ]
  }
  ```
  Une CSP stricte est plus délicate ici (Supabase, Sentry, images `data:`/blob pour la compression photo côté client) — à construire et tester séparément plutôt que de l'ajouter à l'aveugle.

### M4 — Rate-limiting et expiration OTP non vérifiables (config Dashboard, pas de code)

- **Où** : Supabase Dashboard → Authentication → Rate Limits / Providers → Email.
- **Constat** : les logs Auth des dernières 24h confirment que le rate-limiting **est actif** (49 réponses `429`, code d'erreur `over_email_send_rate_limit` observés lors des tests de ce soir) — c'est le comportement natif de Supabase Auth, aucune régression détectée. En revanche, les valeurs exactes (nombre de tentatives autorisées, durée d'expiration du code OTP, nombre max de tentatives de vérification) sont des réglages du Dashboard, non lisibles via SQL/API depuis cet audit.
- **Recommandation** : vérifier manuellement dans le Dashboard que l'expiration du code OTP est courte (≤ 10 min, idéalement 5 min comme demandé dans le brief) — la valeur par défaut de Supabase peut être plus longue (jusqu'à 1h pour les OTP e-mail selon les versions). Un code numérique à 6 chiffres (1 000 000 de combinaisons) reste théoriquement brute-forçable si la fenêtre de validité est longue et si le rate-limit sur `/verify` (par IP, distinct du rate-limit d'envoi) n'est pas assez strict — à confirmer/durcir dans le Dashboard, aucune action code nécessaire.

---

## 🟡 Faible

### F1 — `delete_my_account()` exécutable par le rôle `anon`

- **Où** : `GRANT EXECUTE` sur `public.delete_my_account()` inclut `anon` (confirmé par requête sur `pg_proc`/`has_function_privilege`).
- **Risque** : nul en pratique — la fonction fait `delete from auth.users where id = auth.uid()`, et `auth.uid()` vaut `NULL` pour une requête anonyme, donc la suppression ne cible aucune ligne. Reste une surface d'attaque inutile et une incohérence avec le principe du moindre privilège appliqué partout ailleurs dans le projet.
- **Correctif** : `revoke execute on function public.delete_my_account() from anon;`

### F2 — Pas de contrainte anti-spam sur `price_reports`

- **Où** : table `price_reports` — seule contrainte : clé primaire (`id`). Aucune contrainte `UNIQUE (price_id, user_id)`, contrairement à `price_ratings` qui en a une.
- **Risque** : un utilisateur peut signaler plusieurs fois le même prix, gonflant artificiellement la file de modération admin. Pas d'escalade automatique de statut basée sur les signalements (contrairement aux votes), donc impact limité à de la nuisance pour les modérateurs.
- **Correctif** : `alter table price_reports add constraint price_reports_price_id_user_id_key unique (price_id, user_id);` (nécessite d'adapter le code applicatif si un utilisateur doit pouvoir modifier son signalement plutôt qu'en créer un nouveau).

### F3 — `product_id` modifiable lors de l'édition d'un prix par son propriétaire

- **Où** : GRANT `UPDATE` du rôle `authenticated` sur `prices` inclut la colonne `product_id`.
- **Risque** : un utilisateur pourrait, via un appel direct à l'API (hors UI, qui ne propose pas ce champ en édition), réassigner un de ses prix à un autre produit — pollution de données mineure, pas de risque de confidentialité/intégrité au-delà du produit ciblé.
- **Correctif** : retirer `product_id` du `GRANT UPDATE` scopé à `authenticated` sur `prices` (le déplacement d'un prix vers un autre produit doit passer par une suppression + recréation, pas une édition).

### F4 — "Leaked Password Protection" désactivée (Supabase Auth)

- **Où** : Dashboard Supabase, signalé par l'advisor de sécurité natif.
- **Constat** : sans impact réel ici — l'app n'utilise **jamais** l'authentification par mot de passe (uniquement OTP e-mail), donc ce réglage ne s'applique à aucun flux utilisateur actuel. Activation à coût nul si un flux mot de passe est ajouté un jour.

### F5 — Dépendances légèrement en retard (non liées à des CVE)

- **Où** : `npm outdated` — `@supabase/supabase-js` (2.110.1 → 2.110.2), `typescript` (6.0.3 → 7.0.2, majeure), `prettier`, `@types/node`.
- **Constat** : `npm audit` ne remonte **aucune vulnérabilité connue** (0 critique/élevée/moyenne/faible sur 478 dépendances). Mise à jour de routine recommandée, pas urgente.

---

## ✅ Points vérifiés et conformes

- **RLS activée** sur les 6 tables `public` (`users`, `products`, `prices`, `price_ratings`, `price_reports`, `price_history`) — confirmé via `pg_class.relrowsecurity`.
- **Lecture publique des prix limitée aux `status='active'`** (policy `prices_select_active_or_own_or_admin`), sauf pour le propriétaire ou un admin.
- **Écriture strictement scopée au propriétaire** sur `prices`/`price_ratings`/`price_reports`/`users` (policies `..._own_or_admin` avec `auth.uid()`), avec GRANTs colonne par colonne pour `authenticated` qui excluent les colonnes système/calculées (`status`, `helpful_votes`, `is_admin`, `median_price`, etc.) — le pattern de durcissement mis en place lors de l'incident du 2026-07-09 est bien respecté côté `authenticated`.
- **Aucune clé `service_role` ni secret réel dans le code ou l'historique git** — seule la clé `anon` (publique par design) et le DSN Sentry (public par design) sont exposés côté client ; `.env` correctement dans `.gitignore`, jamais commité.
- **Aucune préfixation `VITE_` erronée** — seules les 3 variables publiques attendues (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`).
- **Email jamais exposé publiquement** — colonne exclue du `GRANT SELECT` public sur `users` (seules `id, username, karma_score, level, preferred_province, created_at` sont lisibles par `anon`/`authenticated`) ; l'email n'apparaît dans le code que sur les pages Profil/Paramètres du propriétaire lui-même (via `get_my_profile()`, réservé à `authenticated`, retourne uniquement la ligne de l'appelant).
- **Fonctions `SECURITY DEFINER`** (`admin_*`, `is_admin`, `is_banned`, `get_my_profile`, `delete_my_account`) : toutes avec `search_path` explicitement fixé (protection contre le détournement de `search_path`), toutes les actions admin vérifient `is_admin()` en interne avant d'agir, aucune n'est vulnérable à l'injection (arguments typés `uuid`, pas de SQL dynamique).
- **Aucune injection SQL possible** — toutes les requêtes passent par le query builder typé de `supabase-js` (paramétrage automatique côté PostgREST) ou par des RPC à arguments typés ; la recherche full-text utilise `textSearch()` (paramétré), aucune concaténation de SQL brut nulle part dans le code.
- **Aucun vecteur XSS** — pas de `dangerouslySetInnerHTML`, `innerHTML`, `document.write` ni `eval` dans `frontend/src`.
- **Validation d'entrée côté serveur (DB)** cohérente avec le schéma Zod client sur `prices` : contraintes `CHECK` pour `amount > 0`, `purchase_date <= now()`, `city`/`province`/`store_name` non vides.
- **Contrainte anti-double-vote** : `UNIQUE(price_id, user_id)` sur `price_ratings`.
- **Storage** : écriture restreinte au dossier `{user_id}/...` du propriétaire (pas de traversée de chemin possible, `foldername[1] = auth.uid()`).
- **`npm audit`** : 0 vulnérabilité sur 478 dépendances (prod + dev).
- **Pas de secret dans le service worker** — la config Workbox ne fait que du cache HTTP standard, aucune logique métier ni clé embarquée en dur autre que le DSN Sentry (public par design) et l'anon key (publique par design).

---

## Checklist priorisée des actions

1. ~~**[Élevé]** Restreindre les GRANTs `anon` (INSERT/UPDATE) sur `prices`, `price_ratings`, `price_reports`, `products`, `users`, `price_history` — E1.~~ ✅ Corrigé le 2026-07-11.
2. ~~**[Moyen]** Configurer `file_size_limit` + `allowed_mime_types` sur le bucket `price-photos` — M1.~~ ✅ Corrigé le 2026-07-11.
3. ~~**[Moyen]** Vider `queryClient` + caches Workbox à la déconnexion — M2.~~ ✅ Corrigé le 2026-07-11.
4. **[Moyen]** Ajouter les en-têtes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` dans `vercel.json` — M3.
5. **[Moyen]** Vérifier manuellement dans le Dashboard Supabase l'expiration OTP et le rate-limit de `/verify` — M4.
6. **[Faible]** Revoke `EXECUTE` sur `delete_my_account()` pour `anon` — F1.
7. **[Faible]** Ajouter une contrainte `UNIQUE(price_id, user_id)` sur `price_reports` — F2.
8. **[Faible]** Retirer `product_id` du GRANT `UPDATE` authenticated sur `prices` — F3.
9. **[Faible]** Activer "Leaked Password Protection" dans le Dashboard (coût nul, aucun flux mot de passe actuellement) — F4.
10. **[Faible]** Mettre à jour `@supabase/supabase-js` et les devDependencies mineures — F5.

Aucun correctif n'a été appliqué. En attente de validation avant intervention.
