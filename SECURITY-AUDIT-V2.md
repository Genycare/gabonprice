# Audit de sécurité approfondi — GabonPrice (v2)

**Date** : 2026-07-12
**Périmètre** : `frontend/` (Vite 8 / React 19 / TypeScript, PWA) + projet Supabase `Gabon_price` (`vgczurwskvwmbyhstwku`, eu-west-3, Postgres 17). Pas de backend applicatif séparé, pas d'Edge Functions.
**Méthode** : lecture exhaustive du code source (`frontend/src/**`), requêtes SQL directes sur `pg_policies`, `pg_proc` (définitions complètes des fonctions `SECURITY DEFINER`), `information_schema.column_privileges`, `pg_constraint`, `storage.buckets`/`storage.objects` policies, advisors de sécurité/performance natifs Supabase, `npm audit` complet, recherche exhaustive de secrets dans l'historique Git (`git log -p` sur les fichiers `.env*`, recherche par motif `service_role`/`SUPABASE_SERVICE`/`sk_`).
**Fait suite à** `SECURITY-AUDIT.md` (2026-07-11), dont les 10 points ont été traités (9 corrigés, 1 — F4, Leaked Password Protection — bloqué par le plan gratuit Supabase, sans impact réel). Cet audit v2 ne re-détaille pas ces 10 points déjà clos ; il cherche des failles supplémentaires non couvertes par le premier passage.

**Mise à jour (2026-07-12, même session)** : sur demande explicite de l'utilisateur (« tout »), **3 des 4 points Moyens et le point Faible F2026-3 ont été corrigés, testés et déployés** le jour même : M2026-1 (fonctions déplacées vers un schéma non exposé, policies et fonctions admin migrées, vérifié par simulation de rôle en transaction annulée), M2026-3 (CSP stricte ajoutée et testée via Playwright sur 7 routes clés, 0 violation), M2026-4 (message d'erreur brut retiré de `ErrorBoundary`, remplacé par un identifiant d'événement Sentry), F2026-3 (`EXECUTE` révoqué sur `rls_auto_enable()`, confirmé disparu de l'advisor de sécurité). Seul **M2026-2** (validation MIME des photos) reste un risque résiduel **accepté** (correctif nécessiterait une Edge Function dédiée, non prioritaire au stade actuel — voir sa fiche). Les points F2026-1, F2026-2, F2026-4 et les points informatifs restent des recommandations non appliquées (actions manuelles Dashboard ou risques produits acceptés).

---

## Résumé exécutif

Après un second passage approfondi, **aucune faille Critique ni Élevée n'a été trouvée**. Le projet reste sur une base solide : RLS cohérente et vérifiée policy par policy, aucun secret dans le code ou l'historique Git, aucun vecteur XSS classique, `npm audit` propre, contrôles d'accès serveur systématiquement redondants avec les gardes-fous côté client (jamais l'inverse).

Les points relevés ci-dessous sont **4 failles Moyennes** (défense en profondeur incomplète, pas d'exploitation triviale confirmée) et **4 points Faibles/Informatifs** — dont un résidu direct du **M3** de l'audit v1 (CSP toujours absente) et un nouveau point notable : les fonctions internes `is_admin()`/`is_banned()` étaient appelables publiquement via RPC avec un `uid` arbitraire, ce qui permettait à quiconque de vérifier si un UUID donné était administrateur ou banni. **3 des 4 Moyens et 1 des 4 Faibles ont été corrigés le jour même** (voir encart de mise à jour ci-dessus).

---

## 🔴 Critique

*Aucun point critique identifié.*

## 🟠 Élevé

*Aucun point élevé identifié.*

## 🟡 Moyen

### M2026-1 — `is_admin()`/`is_banned()` exposées publiquement via RPC avec `uid` arbitraire (énumération de statut privilégié) — ✅ CORRIGÉ (2026-07-12)

> Fonctions déplacées vers un nouveau schéma `internal` (non exposé par PostgREST, qui n'expose que `public` par défaut). `internal.is_admin()`/`internal.is_banned()` gardent `EXECUTE` pour `anon`/`authenticated` (nécessaire à l'évaluation des policies RLS), mais ne sont plus routées comme endpoints RPC. Les 9 policies RLS (6 pour `is_admin`, 3 pour `is_banned`) et les 5 fonctions `admin_*` ont été mises à jour pour référencer `internal.*`. Les anciennes `public.is_admin(uuid)`/`public.is_banned(uuid)` ont été supprimées après vérification qu'aucun autre appelant n'y faisait référence. Vérifié par simulation de rôle en transaction annulée : `anon` voit toujours les 28 prix actifs après la migration ; un admin simulé obtient `admin_get_stats()` avec succès ; un non-admin simulé reçoit `not authorized` ; `has_function_privilege` confirme `public.is_admin`/`is_banned` absentes et `internal.*` accessibles aux deux rôles API. Confirmé disparu de l'advisor de sécurité Supabase après application.

- **Où** : `public.is_admin(uid uuid default auth.uid())`, `public.is_banned(uid uuid default auth.uid())` — `SECURITY DEFINER`, `EXECUTE` accordé à `anon` **et** `authenticated` (vérifié via `has_function_privilege`), donc exposées par PostgREST sur `/rest/v1/rpc/is_admin` et `/rest/v1/rpc/is_banned`.
- **Scénario d'exploitation** : ces fonctions acceptent un paramètre `uid` explicite (pas seulement `auth.uid()` implicite). N'importe qui — même non authentifié — peut appeler :
  ```
  POST /rest/v1/rpc/is_admin
  { "uid": "<uuid-cible>" }
  ```
  et obtenir `true`/`false`. Les UUID de contributeurs sont publiquement visibles (colonne `user_id` accordée en `SELECT` à `anon` sur `prices`, jointure `users` dans les fiches produit). Un attaquant peut donc énumérer, pour tout contributeur visible dans l'app, s'il est administrateur ou banni — une information utile pour cibler un compte admin (social engineering, phishing, tentative de contournement ailleurs) sans laisser de trace applicative (pas de session requise).
- **Sévérité** : CVSS approx. **5.3** (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N) — divulgation d'information, aucun impact direct sur l'intégrité/disponibilité, mais facilite le ciblage de comptes à privilèges.
- **Pourquoi ce n'est pas un simple `REVOKE`** : ces deux fonctions sont invoquées **à l'intérieur des policies RLS** (`prices_select_active_or_own_or_admin`, `price_reports_select_own_or_admin`, `prices_update_own_or_admin`, `users_update_own_or_admin`, `prices_delete_own_or_admin`), dont certaines s'appliquent au rôle `anon` lui-même. Retirer `EXECUTE` à `anon`/`authenticated` casserait l'évaluation de ces policies (erreur `permission denied for function is_admin` sur des requêtes SELECT légitimes) — **ne pas faire un simple REVOKE sans migration des policies**.
- **Correctif recommandé** : déplacer `is_admin()`/`is_banned()` dans un schéma non exposé par PostgREST (ex. `internal`), et faire référencer ce schéma dans les policies RLS existantes (le moteur RLS de Postgres n'est pas affecté par le schéma d'exposition PostgREST — seule l'API REST publique l'est). Exemple :
  ```sql
  create schema if not exists internal;

  create or replace function internal.is_admin(uid uuid default auth.uid())
  returns boolean
  language sql stable security definer
  set search_path to 'public', 'pg_temp'
  as $$ select coalesce((select u.is_admin from public.users u where u.id = uid), false); $$;

  -- répéter pour is_banned(), puis :
  revoke execute on function public.is_admin(uuid) from anon, authenticated;
  revoke execute on function public.is_banned(uuid) from anon, authenticated;

  -- mettre à jour chaque policy pour référencer internal.is_admin()/internal.is_banned()
  -- au lieu de public.is_admin()/public.is_banned() (ALTER POLICY ... USING (... internal.is_admin() ...))
  ```
  PostgREST n'expose que le schéma configuré dans `db-schemas` (par défaut `public`), donc `internal.*` devient invisible à l'API tout en restant appelable par le moteur RLS qui s'exécute au niveau du moteur SQL, pas de l'API.

### M2026-2 — Validation du type MIME des photos basée uniquement sur le `Content-Type` déclaré par le client (pas de vérification des octets réels) — ⚠️ Risque résiduel accepté (pas de correctif appliqué)

- **Où** : `storage.buckets.price-photos` (`allowed_mime_types = ['image/jpeg','image/png','image/webp']`, corrigé en M1 de l'audit v1) ; `frontend/src/lib/photo.ts:42-44` (`uploadPricePhoto`, force `contentType: 'image/jpeg'` côté client).
- **Constat** : Supabase Storage valide le champ `allowed_mime_types` en comparant l'en-tête `Content-Type` **fourni par le client au moment de l'upload**, pas en inspectant les octets réels du fichier (pas de "magic byte sniffing"). Le flux normal de l'app est sûr (compression `canvas.toBlob(..., 'image/jpeg', ...)` qui ré-encode réellement l'image, donc le contenu correspond toujours au type déclaré). Mais un utilisateur authentifié peut appeler directement l'API Storage (avec son propre JWT, hors app) et uploader un fichier arbitraire tant qu'il déclare `Content-Type: image/jpeg` et reste sous 300 Ko — y compris un fichier HTML/SVG/polyglotte contenant du script.
- **Impact réel limité** : le bucket sert le fichier avec le `Content-Type` **stocké** (celui déclaré à l'upload, donc `image/jpeg`), pas celui détecté dynamiquement — un navigateur n'exécute normalement pas du HTML/JS servi avec `Content-Type: image/jpeg`. Le fichier est en outre servi depuis `*.supabase.co`, une origine distincte de `gabonprice.vercel.app` (isolation de session/cookies déjà notée en M1 v1).
- **Sévérité** : CVSS approx. **3.7** (AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N) — nécessite un compte authentifié et un appel API direct hors app, impact cantonné à l'hébergement de contenu sous un sous-domaine de confiance Supabase, pas d'exécution dans le contexte de l'app.
- **Correctif recommandé** : impossible à corriger uniquement côté config Storage (limitation native de Supabase). Deux options : (a) accepter le risque résiduel (déjà largement mitigé par M1 + isolation d'origine), ou (b) ajouter une Edge Function `validate-upload` qui télécharge le fichier juste uploadé, vérifie sa signature binaire réelle (magic bytes JPEG `FF D8 FF`/PNG `89 50 4E 47`/WebP `52 49 46 46...57 45 42 50`) et supprime le fichier + révoque si non conforme — pertinent seulement si le volume d'utilisateurs malveillants devient un problème réel, pas prioritaire au stade actuel du projet (MVP, base d'utilisateurs de confiance).

### M2026-3 — Content-Security-Policy toujours absente (résidu de M3, audit v1) — ✅ CORRIGÉ (2026-07-12)

> CSP ajoutée dans `frontend/vercel.json` : `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://*.sentry.io; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`. Testée en conditions réelles : build de production servi par un petit serveur local reproduisant les en-têtes Vercel, parcouru avec Playwright sur 7 routes (`/`, `/connexion`, `/recherche`, `/ajouter`, `/profil`, `/historique`, `/parametres`) avec écoute des messages console/erreurs de page/requêtes échouées — **0 violation CSP détectée**, rendu visuel confirmé par capture d'écran (données Supabase chargées normalement, images affichées). `frame-ancestors 'none'` rend `X-Frame-Options: DENY` redondant mais les deux sont conservés (compatibilité navigateurs plus anciens).

- **Où** : `frontend/vercel.json` — 4 en-têtes présents (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), aucune `Content-Security-Policy`. Déjà noté comme exclusion volontaire dans l'audit v1 (M3), toujours vrai aujourd'hui.
- **Pourquoi le re-signaler maintenant** : `@supabase/supabase-js` stocke le token de session (JWT + refresh token) en **`localStorage`** par défaut, pas dans un cookie `httpOnly`. Aucun XSS n'a été trouvé dans le code actuel (confirmé : aucun `dangerouslySetInnerHTML`/`innerHTML`/`eval`/`javascript:` dans `frontend/src`), mais en l'absence de CSP, une régression future (dépendance compromise, faute de frappe introduisant du HTML non échappé) donnerait un accès immédiat au token de session via `localStorage.getItem('sb-...-auth-token')`. La CSP est la seule défense en profondeur qui limiterait l'impact d'un tel scénario même après l'introduction du bug.
- **Sévérité** : CVSS approx. **4.5** (facteur aggravant hypothétique, pas une faille exploitable en l'état — noté Moyen car c'est un filet de sécurité manquant pour un actif sensible (session token), pas une vulnérabilité active).
- **Correctif recommandé** (à tester en profondeur avant déploiement — un CSP mal calibré casse l'app) :
  ```json
  {
    "key": "Content-Security-Policy",
    "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://*.sentry.io; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  }
  ```
  `style-src 'unsafe-inline'` nécessaire tant que Tailwind v4 / styles inline React (`style={{...}}`, utilisés dans `HomePage.tsx`, `InstallPrompt.tsx`) restent en place — à resserrer avec des nonces si un jour prioritaire. `img-src` doit couvrir `data:`/`blob:` (compression photo côté client, canvas) et le domaine Supabase Storage.

### M2026-4 — `ErrorBoundary` affiche le message d'erreur brut à l'utilisateur final — ✅ CORRIGÉ (2026-07-12)

> `frontend/src/components/ErrorBoundary.tsx` : le message d'erreur brut n'est plus affiché. `Sentry.captureException()` retourne désormais son `eventId`, stocké en state et affiché à la place (« Référence : &lt;eventId&gt; ») — utile au support sans exposer aucun détail technique. Le détail complet reste capturé côté Sentry comme avant.

- **Où** : `frontend/src/components/ErrorBoundary.tsx:38` — `<p ...>{this.state.error.message}</p>`.
- **Constat** : ajouté volontairement le 2026-07-12 (cf. `progress.md`) pour diagnostiquer un bug de page blanche via des captures d'écran utilisateur, faute d'accès à la console d'un téléphone Android. Sentry capture déjà l'erreur complète (`Sentry.captureException`) avec stack trace et contexte — l'affichage à l'écran est donc redondant pour le diagnostic, mais expose potentiellement des détails techniques (nom de contrainte SQL, message d'erreur Supabase brut, chemin de fichier interne à une dépendance) à n'importe quel utilisateur rencontrant une erreur, ce qui facilite le fingerprinting de la stack technique par un attaquant.
- **Scénario** : un attaquant provoque volontairement une erreur (ex. état incohérent via manipulation de `localStorage`/paramètres d'URL) et lit le message affiché pour en déduire des détails d'implémentation (ORM, contraintes DB, versions de libs).
- **Sévérité** : CVSS approx. **3.1** (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N) — divulgation d'information mineure, pas d'accès direct à des données.
- **Correctif recommandé** : retirer l'affichage du message brut maintenant que Sentry est en place et fonctionnel (le diagnostic ad hoc n'est plus nécessaire) :
  ```tsx
  // Retirer complètement, ou remplacer par un identifiant d'événement Sentry
  // (utile au support sans exposer le détail technique) :
  const eventId = Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } })
  // ...
  {this.state.eventId && <p className="text-xs text-muted/70">Référence : {this.state.eventId}</p>}
  ```

---

## 🟢 Faible / Informatif

### F2026-1 — Vérifier que l'authentification par mot de passe est désactivée sur le provider Email Supabase

- **Où** : Dashboard Supabase → Authentication → Sign In / Providers → Email — capture d'écran obtenue pendant l'audit montre des champs "Minimum password length" / "Password requirements" actifs sur ce provider, alors que l'app n'utilise **jamais** `signInWithPassword`/`signUp` avec mot de passe (uniquement `signInWithOtp`).
- **Constat** : si le provider Email autorise toujours l'inscription/connexion par mot de passe en parallèle de l'OTP, un attaquant pourrait appeler directement l'API publique (`supabase.auth.signUp({email, password})` avec la clé `anon`, publique par design) pour des flux jamais prévus par l'app — surface d'attaque inutile pour une fonctionnalité non utilisée. Non vérifiable/désactivable via SQL ou les outils disponibles ici (réglage de plateforme Dashboard, même famille que M4/F4 de l'audit v1).
- **Sévérité** : Informatif — pas de preuve d'exploitation, principe du moindre privilège.
- **Recommandation** : dans Dashboard → Authentication → Sign In / Providers → Email, si une option distincte type "Enable password sign-in" existe, la désactiver et ne garder que l'OTP.

### F2026-2 — Cache Workbox `supabase-api` non scindé par session (dépend d'une déconnexion explicite)

- **Où** : `frontend/vite.config.ts:52-64` (cache `NetworkFirst`, clé = URL de la requête, pas de variation par utilisateur/session) ; le nettoyage à la déconnexion (`queryClient.clear()` + purge des caches Workbox) a été ajouté en M2 (audit v1) et fonctionne pour un `signOut()` explicite.
- **Constat résiduel** : si la session expire silencieusement (token JWT expiré) sans que l'utilisateur clique sur "Déconnexion", le cache HTTP local n'est jamais purgé. Sur un appareil réellement partagé (PWA familiale), un utilisateur suivant qui ouvre l'app pourrait voir brièvement les dernières données mises en cache de la session précédente avant que la revalidation réseau (NetworkFirst) ne les remplace.
- **Sévérité** : Faible — nécessite un appareil physiquement partagé et une fenêtre de temps très courte (le temps d'un round-trip réseau), et ne concerne que des données déjà publiques pour l'essentiel (prix actifs).
- **Recommandation** : accepter le risque résiduel (usage attendu : appareil personnel), ou ajouter un TTL plus court sur le cache `supabase-api` (actuellement 24h) si le scénario d'appareil partagé devient une préoccupation réelle.

### F2026-3 — `rls_auto_enable()` exposée en RPC public (bruit sur l'advisor, non exploitable) — ✅ CORRIGÉ (2026-07-12, hygiène)

- **Où** : `public.rls_auto_enable()` — fonction `event_trigger` (probablement posée par Supabase lui-même à la création du projet, pas par le code applicatif), `EXECUTE` accordé à `anon`/`authenticated`, signalée par l'advisor de sécurité.
- **Constat** : son type de retour (`event_trigger`) empêche tout appel direct via SQL ou RPC — Postgres refuse même à un superutilisateur d'exécuter une fonction `event_trigger` manuellement (« event trigger functions can only be called by the trigger manager »). **Faux positif confirmé**, aucune exploitation possible. `EXECUTE` révoqué de `anon`/`authenticated`/`public` par hygiène (aucun risque à le faire, la fonction n'étant appelable que par le moteur de triggers) — confirmé disparu de l'advisor de sécurité Supabase après application.

### F2026-4 — Abus multi-comptes du système de karma/votes (limite structurelle de l'architecture OTP e-mail)

- **Où** : conception globale — toute adresse e-mail valide (y compris jetables/`+alias`) peut créer un compte et voter/publier.
- **Constat** : aucune vérification n'empêche un utilisateur de créer plusieurs comptes (adresses Gmail avec `+tag`, services d'e-mail jetables) pour voter plusieurs fois sur le même prix, gonfler son propre karma, ou faire passer artificiellement un prix concurrent en `flagged`/`removed`. C'est une limite **structurelle** du choix produit (OTP e-mail, décision du 2026-07-11 pour éviter le coût SMS), pas un bug de code — la contrainte technique `UNIQUE(price_id, user_id)` empêche bien le double-vote **par compte**, mais pas le sockpuppeting inter-comptes.
- **Sévérité** : Informatif — risque business plutôt que sécurité technique, pertinent seulement à l'échelle (peu probable au lancement avec une poignée de contributeurs de confiance, cf. checklist d'amorçage).
- **Recommandation** (à activer seulement si un abus réel est constaté, pas préventivement) : limiter le nombre de prix/votes par IP/fenêtre de temps, ou exiger un karma minimum avant que les votes d'un compte comptent pleinement dans l'escalade de modération.

### Informatif — Réglages de plateforme non vérifiables avec les outils actuels

- **Durée/rotation de session JWT** (Dashboard → Authentication → Sessions) : non vérifiée dans cet audit (même limite que M4/F4 v1 — réglage Dashboard, pas de table Postgres accessible). Les valeurs par défaut Supabase (access token 1h, refresh token rotatif) sont raisonnables ; à confirmer manuellement si souhaité.
- **Sentry sans `beforeSend` de nettoyage PII** (`frontend/src/lib/sentry.ts`) : aucune fuite de PII observée dans les traces Sentry examinées (le breadcrumb réseau capturé lors d'un incident récent montrait `"url":"[Filtered]"`, confirmant que le SDK filtre déjà les URLs sensibles par défaut). Recommandation de durcissement préventif, pas une faille constatée : ajouter un `beforeSend` qui retire tout champ `email` d'un contexte d'erreur avant envoi, en cas d'évolution future du code qui capturerait des objets contenant des PII.
- **Index inutilisé `products_category_idx`** (advisor performance, INFO) — hors périmètre sécurité, mentionné pour complétude.

---

## ✅ Points vérifiés et conformes (au-delà de l'audit v1)

- **Aucun vecteur XSS** dans tout `frontend/src` : recherche exhaustive de `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval(`, `javascript:` — zéro résultat.
- **Toutes les policies RLS relues intégralement** (`pg_policies`, 15 policies sur 6 tables) : aucune policy `USING (true)` en écriture, toutes les policies d'écriture scopées à `authenticated` avec `auth.uid()` ou `is_admin()`, lecture publique strictement limitée aux colonnes/lignes prévues.
- **Contraintes DB redondantes avec Zod côté serveur** : `price_ratings_rating_check` (`rating IN (1,-1)`), `prices_amount_check` (`> 0`), `prices_purchase_date_not_future`, `prices_city_not_blank`/`province_not_blank`/`store_name_not_blank`, `UNIQUE(price_id, user_id)` sur `price_ratings` **et** `price_reports` (anti-spam vote/signalement).
- **Toutes les fonctions `SECURITY DEFINER`** (`is_admin`, `is_banned`, `get_my_profile`, `delete_my_account`, `admin_*`, triggers de recalcul) ont `search_path` explicitement épinglé (`SET search_path TO 'public','pg_temp'`) — pas de vecteur de détournement de `search_path`.
- **Fonctions admin (`admin_ban_user`, `admin_delete_price`, `admin_restore_price`, `admin_resolve_report`, `admin_get_stats`)** : chacune revérifiée dans son code source, vérifie `is_admin()` en première ligne avant toute action, lève une exception sinon ; `EXECUTE` confirmé non accordé à `anon` (uniquement `authenticated`, protection RLS de toute façon redondante).
- **`get_my_profile()`/`delete_my_account()`** : confirmé non exécutables par `anon` (F1 de l'audit v1 bien en place, revérifié directement via `has_function_privilege`).
- **Storage `price-photos`** : pas de policy `UPDATE` → écrasement de fichier d'autrui impossible ; chemin `{user_id}/{crypto.randomUUID()}.jpg` non devinable et généré côté client sans contrôle utilisateur sur le nom → pas de traversée de chemin possible ; policy `DELETE` scopée au dossier du propriétaire.
- **EXIF strippé de facto** : `compressImage()` (`frontend/src/lib/photo.ts`) ré-encode systématiquement via `<canvas>.toBlob()`, qui ne préserve aucune métadonnée EXIF de l'image source.
- **IDOR sur l'édition de prix** : double contrôle — garde client (`AddPricePage.tsx:64`, redirige si `price.user_id !== session.user.id`) **et** policy RLS serveur (`prices_update_own_or_admin`) qui reste autoritaire même si le garde client était contourné.
- **`RequireAdmin` est un gate cosmétique, pas la vraie barrière** : l'autorisation réelle est vérifiée côté serveur (`is_admin()` dans RLS et dans chaque fonction admin) — un contournement du routeur React ne donnerait accès à aucune donnée ni action réelle.
- **Anti-énumération de compte OTP** : `LoginPage.tsx` appelle `signInWithOtp({ email })` sans `shouldCreateUser: false`, comportement par défaut Supabase = réponse générique identique que l'e-mail existe déjà ou non (création automatique silencieuse). Confirmé par lecture du code, pas de branche conditionnelle sur l'existence du compte.
- **Mode hors-ligne sans bypass d'auth** : `RequireAuth`/`RequireAdmin` s'appuient exclusivement sur `useSession()` (état Supabase réel), aucune logique de "mode dégradé authentifié" en cas de perte réseau ; la file d'attente offline (`offlineQueue.ts`) ne contient que les propres soumissions de l'utilisateur courant, stockées localement sans jamais être exposées à d'autres comptes.
- **Aucun secret dans l'historique Git** : recherche exhaustive (`git log -p` sur tous les fichiers `.env*` de tout l'historique, recherche par motif sur `service_role`/`SUPABASE_SERVICE`/`sk_`) — seul `frontend/.env.example` (vide, gabarit) a jamais été commité. `.gitignore` exclut correctement `.env`.
- **`npm audit`** : 0 vulnérabilité sur 478 dépendances (73 prod, 362 dev, 88 optionnelles). `package-lock.json` présent et committé (cohérence des builds garantie).
- **Dépendances de confiance** : aucun signe de typosquatting — toutes les dépendances de premier niveau sont des paquets reconnus et largement maintenus (`react`, `@supabase/supabase-js`, `@tanstack/*`, `zod`, `react-hook-form`, `react-router-dom`, `zustand`, `@sentry/react`, `lunr`).

---

## Matrice récapitulative

| ID | Faille | Sévérité | CVSS approx. | Effort de correction | Statut |
|---|---|---|---|---|---|
| M2026-1 | `is_admin()`/`is_banned()` énumérables via RPC public | 🟡 Moyen | 5.3 | Moyen (migration schéma + mise à jour de 5 policies) | ✅ Corrigé 2026-07-12 |
| M2026-2 | Type MIME photo validé par déclaration client, pas par contenu réel | 🟡 Moyen | 3.7 | Élevé (Edge Function de validation) ou accepté tel quel | ⚠️ Accepté, non corrigé |
| M2026-3 | CSP absente (résidu M3 v1) | 🟡 Moyen | 4.5 | Moyen (calibrage + tests approfondis) | ✅ Corrigé 2026-07-12 |
| M2026-4 | `ErrorBoundary` affiche le message d'erreur brut | 🟡 Moyen | 3.1 | Faible (1 ligne à retirer/remplacer) | ✅ Corrigé 2026-07-12 |
| F2026-1 | Password sign-in peut-être encore actif sur le provider Email | 🟢 Faible | — | Faible (1 toggle Dashboard) | ⏳ Action manuelle requise |
| F2026-2 | Cache Workbox non scindé par session (expiration silencieuse) | 🟢 Faible | — | Faible (TTL) à Nul (accepté) | ⚠️ Accepté, non corrigé |
| F2026-3 | `rls_auto_enable()` bruit d'advisor, faux positif | 🟢 Informatif | — | Nul | ✅ Corrigé 2026-07-12 |
| F2026-4 | Sockpuppeting multi-comptes (karma/votes) | 🟢 Informatif | — | Élevé (hors scope actuel) | ⚠️ Accepté, risque produit |
| Info | Durée de session JWT non vérifiée (Dashboard) | 🔵 Informatif | — | Faible (vérification manuelle) | ⏳ Action manuelle requise |
| Info | Sentry sans `beforeSend` PII | 🔵 Informatif | — | Faible (durcissement préventif) | ⚠️ Non appliqué |

---

## Top 10 des actions prioritaires avant une mise en production plus large

1. **M2026-4** — Retirer l'affichage du message d'erreur brut dans `ErrorBoundary.tsx` (le plus rapide, 1 ligne, Sentry couvre déjà le diagnostic).
2. **M2026-1** — Déplacer `is_admin()`/`is_banned()` vers un schéma non exposé par PostgREST, avec migration des 5 policies qui les référencent (tester en transaction annulée avant déploiement, comme pour les correctifs de l'audit v1).
3. **F2026-1** — Vérifier/désactiver l'authentification par mot de passe sur le provider Email Supabase si elle est encore active (2 min, Dashboard).
4. **M2026-3** — Construire et tester une CSP stricte (le report-only d'abord, en observant les violations avant de passer en mode bloquant) — chantier dédié comme prévu depuis l'audit v1.
5. Vérifier manuellement la durée de session JWT / rotation des refresh tokens dans Dashboard → Authentication → Sessions (même famille que M4 v1, à clore de la même façon).
6. **M2026-2** — Accepter formellement le risque résiduel (documenté), ou budgétiser une Edge Function de validation de magic bytes si le volume d'utilisateurs non fiables augmente.
7. Ajouter un `beforeSend` Sentry de nettoyage PII par précaution (aucune fuite constatée, mais coût quasi nul).
8. **F2026-2** — Envisager un TTL plus court sur le cache `supabase-api` si l'usage sur appareil partagé devient un cas réel (actuellement théorique).
9. Documenter formellement F2026-4 (sockpuppeting) comme risque produit accepté au stade actuel, à réévaluer si l'app grandit.
10. Revalider F4 (Leaked Password Protection, audit v1) si le projet passe un jour sur le plan Pro Supabase pour d'autres raisons — sinon rester tel quel (déjà documenté, pas d'action requise).

---

## Tests de non-régression à rejouer après correctifs

À exécuter en transaction SQL annulée (`begin; ... rollback;`) pour les tests base de données, comme dans l'audit v1, puis `npm run build` + test manuel/Playwright pour le frontend :

**Après M2026-1 (déplacement des fonctions vers `internal`) :**
- [ ] Un utilisateur anonyme peut toujours lire les prix `active` (`select * from prices` en rôle `anon` → policy `prices_select_active_or_own_or_admin` doit toujours retourner les lignes actives).
- [ ] Un utilisateur authentifié non-admin peut toujours lire/modifier ses propres prix.
- [ ] Un admin peut toujours lire/modifier les prix des autres (`is_admin()` doit toujours s'évaluer correctement dans les policies après le renommage).
- [ ] `POST /rest/v1/rpc/is_admin` et `/rest/v1/rpc/is_banned` renvoient désormais une erreur 404/permission (fonction non trouvée dans le schéma exposé), au lieu d'un booléen.
- [ ] Les 4 actions admin (`admin_restore_price`, `admin_delete_price`, `admin_ban_user`, `admin_resolve_report`) fonctionnent toujours (elles appellent `is_admin()` en interne, potentiellement `internal.is_admin()` après la migration).

**Après M2026-3 (ajout de la CSP) :**
- [ ] Toutes les pages se chargent sans erreur console liée à la CSP (script/style/image/connect bloqués par erreur).
- [ ] Connexion OTP + vérification fonctionnent (requêtes vers `*.supabase.co`).
- [ ] Sentry reçoit toujours les erreurs (requêtes vers `*.sentry.io` non bloquées).
- [ ] Upload de photo de prix fonctionne (compression canvas → `data:`/`blob:` non bloqués).
- [ ] Installation PWA (Android + iOS) toujours fonctionnelle.

**Après M2026-4 (ErrorBoundary) :**
- [ ] Provoquer une erreur volontaire (ex. composant qui `throw`) → l'écran de secours s'affiche toujours, sans le message brut, avec un identifiant d'événement si implémenté.
- [ ] Vérifier que l'erreur complète est toujours bien reçue côté Sentry (dashboard Sentry, pas juste l'UI).

**Après F2026-1 (désactivation password sign-in si applicable) :**
- [ ] Le flux OTP e-mail (connexion/vérification) reste inchangé et fonctionnel.
- [ ] Un appel direct à `supabase.auth.signInWithPassword()` (test manuel via `curl`/console) est désormais rejeté.
