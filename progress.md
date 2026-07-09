# PROGRESS — GabonPrice

> Suivi d'avancement du projet. **Claude Code coche `[x]` chaque tâche terminée.**
> Convention : `[ ]` à faire · `[~]` en cours · `[x]` fait.
> Se réfère au `cahier-des-charges.md`.

**Stack retenue :** Chemin A (Vercel + Supabase + Infobip) · **Logo :** Option 1 (étiquette).

---

## Phase 0 — Setup du projet

- [x] Créer le dépôt Git (mono-repo ou front/back séparés) + README
- [x] Initialiser le frontend : Vite + React + **TypeScript** (`frontend/`, React 19 + Vite 8 + TS strict)
- [x] Configurer TailwindCSS avec les design tokens du cahier des charges (Tailwind v4 via `@tailwindcss/vite`, tokens dans `src/index.css`)
- [x] Installer les libs de base : TanStack Query, Zustand, React Hook Form, Zod, React Router
- [x] Mettre en place ESLint + Prettier + config TS stricte (oxlint + `.oxlintrc.json`, `.prettierrc.json`, `strict: true`)
- [x] Créer le projet Supabase et récupérer les clés (`.env`, ne jamais commiter) — projet `Gabon_price` (`vgczurwskvwmbyhstwku`), `.env` local rempli
- [x] Configurer le déploiement Vercel — projet `gabonprice` en production : https://gabonprice.vercel.app, **lié au repo GitHub `Genycare/gabonprice`** (Root Directory `frontend`, env vars Supabase configurées) → déploiement continu actif sur `main` + previews par PR
- [x] Copier `logo-gabonprice/` dans `public/` (icônes + `manifest.json`) et intégrer le `<head>` en suivant `INTEGRATION-PWA.md` (logo Option 1, favicons, icônes PWA) — manifest géré par `vite-plugin-pwa` (pas de doublon statique)
- [x] Poser la structure de dossiers (composants, pages, hooks, lib, types)
- [x] Créer les composants UI réutilisables de base (Button, Input, Card, BottomNav)

## Phase 1 — Authentification (OTP)

- [x] Créer la table `users` + RLS (profil auto-créé via trigger sur `auth.users`, niveaux calculés automatiquement)
- [x] Écran de connexion : saisie du numéro `+241` avec formatage (auto-format `X XX XX XX XX`, d'après `gabonprice-login-ULTIMATE.html`)
- [x] Endpoint / fonction d'envoi du code OTP — **Twilio** via Supabase Auth natif (`signInWithOtp`) plutôt qu'Infobip (écart au cahier des charges, décision utilisateur) ; ⚠️ **à activer dans le dashboard Supabase** (Authentication → Providers → Phone → Twilio, clés non configurables par API)
- [x] **Rate-limiting** sur l'envoi d'OTP — géré nativement par Supabase Auth (pas de logique custom nécessaire)
- [x] Stockage du code haché + expiration — géré nativement par Supabase Auth
- [x] Écran de vérification : 6 cases, auto-focus + support paste, renvoi avec minuteur 30s (d'après `gabonprice-otp-verification.html`)
- [x] Vérification du code + création/connexion de l'utilisateur + session — `supabase.auth.verifyOtp`, profil auto-créé via trigger existant
- [x] Gestion des erreurs (code faux, expiré, rate limit) — messages d'erreur affichés sur les deux écrans
- [x] Redirection post-connexion vers l'accueil
- [x] (Fast-follow) Plan WhatsApp OTP documenté — voir « Plan WhatsApp OTP (fast-follow) » ci-dessous
- [x] Protection des routes (redirection vers `/connexion` si non authentifié) — `RequireAuth` (route layout avec `Outlet`) + hook `useSession` (session Supabase + écoute `onAuthStateChange`), routes `/`, `/recherche`, `/produit/:id`, `/ajouter`, `/historique`, `/profil` protégées ; `/connexion` et `/verification` restent publiques

### Plan WhatsApp OTP (fast-follow)

> Non implémenté — à activer seulement si le SMS Twilio s'avère trop coûteux ou peu fiable au Gabon (cf. cahier des charges §7 et §14).

- **Limite actuelle** : le provider Phone de Supabase Auth (utilisé via `signInWithOtp`/`verifyOtp`) est configuré avec **un seul canal Twilio par projet** (SMS *ou* WhatsApp, pas les deux à la fois côté Dashboard). On ne peut donc pas basculer par utilisateur simplement en changeant un paramètre d'appel.
- **Option retenue si besoin** : contourner le provider natif et appeler l'API **Twilio Verify** directement (elle supporte `channel: "sms"` et `channel: "whatsapp"` sur la même requête) depuis deux Edge Functions Supabase :
  - `send-otp` : crée une vérification Twilio avec le canal choisi par l'utilisateur.
  - `verify-otp` : appelle `verificationChecks`, puis si OK crée/connecte l'utilisateur via l'API Admin Supabase (`admin.createUser` + `generateLink`, ou un JWT signé côté serveur) puisqu'on sort du flux `auth.signInWithOtp` natif.
  - Rate-limiting et expiration à réimplémenter manuellement (plus géré nativement par Supabase Auth dans ce cas).
- **Impact UI** : ajouter un choix « Recevoir par SMS / WhatsApp » sur l'écran de connexion.
- **Déclencheur** : à activer seulement si le taux de délivrabilité SMS Twilio au Gabon est mauvais ou si le coût SMS devient prohibitif (à surveiller après lancement, cf. Phase 8 amorçage).

## Phase 2 — Modèle de données & API

- [x] Créer les tables `products`, `prices`, `price_ratings`, `price_reports`, `price_history`
- [x] Index full-text (`tsvector`) sur `products` (config `french`, trigger de maintenance auto)
- [x] RLS sur toutes les tables (lecture publique des prix `active`, écriture = propriétaire, admin = rôle) — advisors sécurité/perf Supabase passés au propre
- [x] Seed de données réalistes (produits + magasins + quelques prix de test) — 11 produits (une catégorie de chaque), 27 prix répartis sur 4 provinces, historique 7j back-daté pour les tendances
- [x] Lecture des produits (liste, recherche, filtre province/ville) — `lib/products.ts` (`fetchProducts`, recherche full-text `search_vector`, filtre province/ville via jointure sur `prices`), branché sur `SearchPage` (query TanStack)
- [x] Lecture des prix d'un produit (triés du moins cher au plus cher) — `fetchProductPrices` (jointure `prices` + `users` pour contributeur/karma), branché sur `ProductDetailPage`
- [x] Création d'un prix (validation Zod côté client + contraintes côté serveur) — `lib/priceSchema.ts` + `AddPricePage` (sélecteur de produit avec recherche live, soumission réelle via `createPrice`) ; côté serveur, contraintes SQL ajoutées (`prices_purchase_date_not_future`, `prices_store_name_not_blank`, `prices_province_not_blank`, `prices_city_not_blank`, `amount > 0` déjà existante)
- [x] Édition / suppression d'un prix par son propriétaire — `AddPricePage` en mode édition (`?edit=<id>`, vérifie que l'utilisateur est propriétaire) + bouton Supprimer sur `ProductDetailPage` (RLS applique déjà la restriction propriétaire côté serveur)
- [x] Recalcul du `median_price` + `is_median_outlier` à chaque nouveau prix — implémenté en triggers Postgres (`recalc_product_median`, `prices_set_outlier_flag`) plutôt qu'en Edge Function : plus fiable (atomique avec l'écriture), pas de latence réseau supplémentaire
- [x] Mise à jour de `price_trend_7d` et `price_history` — même trigger `recalc_product_median`, testé manuellement (karma, médiane, outlier, transitions `flagged`/`removed`, karma -15)

## Phase 3 — Écrans cœur

- [x] **Accueil** : header + sélecteur de province + recherche (d'après `gabonprice-homepage.html`) — UI fidèle ; barre de recherche maintenant un lien vers `/recherche` (Tendances/Promos/Catégories encore en données mock, pas branchées sur Supabase)
- [x] Accueil : section « Tendances du jour » (scroll horizontal) — UI faite, données mock
- [x] Accueil : section « Promos détectées » — UI faite, données mock
- [x] Accueil : grille de catégories — UI faite, données mock
- [x] Barre de navigation basse (Accueil / Chercher / Ajouter / Historique / Profil)
- [x] **Recherche / résultats** : champ + filtres province/ville + tri (d'après `gabonprice-recherche.html`) — réalignée sur la maquette (bordures des filtres actifs, rayon des cartes 16px, compteur de résultats, badge de tri), branchée sur les vraies données
- [x] **Fiche produit** : stats (médian, min, tendance) + liste des prix (d'après `gabonprice-detail-produit.html`) — UI fidèle, **branchée sur les vraies données** (stats et prix triés réels, plus mock)
- [x] Fiche produit : badge « meilleur prix », localisation, contributeur + karma, date, photo — données réelles (contributeur/karma via jointure), pas de photo de ticket affichée (upload pas encore branché)
- [x] Bouton « S'y rendre » (ouvre l'itinéraire vers le magasin) — lien Google Maps (`latitude`/`longitude` si connus, sinon recherche par nom de magasin + ville), ouvert dans un nouvel onglet
- [x] **Ajouter un prix** : sélection produit + prix + magasin (d'après `gabonprice-ajouter-prix.html`) — UI fidèle, **formulaire branché** : sélecteur de produit avec recherche live, soumission réelle (création + édition) en base
- [x] Ajouter un prix : géolocalisation auto + fallback manuel (Province → Ville → Quartier) — `lib/geolocation.ts` : `navigator.geolocation` + reverse-geocoding via **OpenStreetMap Nominatim** (pas de clé API, usage gratuit à faible volume — à revoir si le trafic augmente, cf. leur politique d'usage) ; si la ville détectée correspond à une des villes connues, badge « Position détectée : Ville, Province » + auto-remplissage, sinon retour silencieux au fallback manuel ; testé en conditions réelles (position simulée à Libreville → bien résolu en "Libreville, Estuaire")
- [x] Ajouter un prix : date d'achat + upload photo (compression < 200 Ko) — `lib/photo.ts` : compression côté client (canvas, redimensionnement 1280px max + réduction de qualité JPEG itérative jusqu'à < 200 Ko), upload vers le bucket Supabase Storage `price-photos` (public en lecture par URL directe, écriture restreinte au propriétaire via RLS sur `storage.objects`, dossier `{user_id}/...`) ; aperçu + bouton Retirer avant envoi ; photo affichée sur `ProductDetailPage` si présente
- [x] **Confirmation d'ajout** (écran de succès, d'après `gabonprice-confirmation.html`) — `ConfirmationPage.tsx` : après une création de prix (pas une édition), redirection vers `/confirmation` avec le résumé (produit, magasin, localisation, prix) et le karma gagné (+10, valeur fixe correspondant à la règle métier déjà en place) ; boutons « Voir le produit » / « Ajouter un autre prix » ; accès direct sans état redirige vers l'accueil

## Phase 4 — Communauté & modération

- [x] Votes 👍 / 👎 sur un prix (contrainte 1 vote / utilisateur / prix) — `lib/ratings.ts` (`setPriceRating` : insère, change ou retire son vote selon l'état courant), boutons cliquables sur `ProductDetailPage` (mis en évidence si déjà voté, désactivés sur son propre prix)
- [x] Transitions de statut auto : 3 votes négatifs → `flagged`, 5 → `removed` — trigger `handle_price_rating_change`, testé (escalade flagged→removed vérifiée)
- [x] Signalement d'un prix (raison + statut `pending`) — `lib/ratings.ts` (`reportPrice`, `fetchMyReportedPriceIds`), sélecteur de motif inline sur `ProductDetailPage` (Prix incorrect / Info trompeuse / Doublon / Autre), bouton remplacé par « Signalé ✓ » une fois fait
- [x] Calcul et attribution du karma (publier +10, 👍 +2, 👎 −1, prix retiré −15) — triggers Postgres, testé
- [x] Affichage du niveau utilisateur d'après le karma — affiché sur `ProfilePage` (niveau + progression vers le niveau suivant) ; `ProductDetailPage` affiche toujours le karma brut du contributeur (pas son niveau), volontairement, pour rester concis sur chaque carte de prix
- [x] Marquage visuel des prix `outlier` (« prix inhabituel ») — badge affiché sur `ProductDetailPage` quand `is_median_outlier` est vrai ; testé avec un prix volontairement aberrant ajouté en base (12 000 F vs médiane ~4 900 F)

## Phase 5 — Offline & PWA

- [ ] Configurer `vite-plugin-pwa` (manifest + service worker) — voir la config prête dans `INTEGRATION-PWA.md`
- [ ] Cache des derniers prix/produits consultés (offline read)
- [ ] File d'attente d'écriture (ajout de prix hors-ligne) + sync au retour réseau
- [ ] Recherche hors-ligne Lunr.js sur sous-ensemble caché
- [ ] Bannière / indicateur d'état réseau (en ligne / hors-ligne)
- [ ] Rendre l'app installable (icônes, splash, test sur Android)

## Phase 6 — Profil, contributions, paramètres

- [x] **Profil** : pseudo, karma, niveau, stats (d'après `gabonprice-profil.html`) — `ProfilePage.tsx` : profil via RPC `get_my_profile()` (username, téléphone, karma, niveau, province préférée — la fonction n'est exécutable que par le rôle `authenticated`, vérifié), stats (karma, prix publiés, provinces) calculées depuis `fetchUserPrices`, barre de progression vers le niveau suivant (`lib/karma.ts`, seuils alignés sur `compute_user_level`), déconnexion fonctionnelle (`supabase.auth.signOut()`)
- [x] **Mes contributions** : historique des prix publiés, éditer / supprimer (d'après `gabonprice-mes-contributions.html`) — `HistoryPage.tsx` (route `/historique`) : `fetchUserPrices` (tous statuts, jointure `products`), tabs Toutes/Actives/Signalées, badges de statut (actif/signalé/retiré), boutons Modifier (renvoie vers `AddPricePage` en mode édition) / Supprimer (masqués pour les prix retirés)
- [ ] **Paramètres** : province préférée, gestion du compte, déconnexion — la déconnexion est déjà faite depuis l'écran Profil ; « Province préférée » n'est affichée qu'en lecture sur le Profil (pas encore éditable) ; pas d'écran Paramètres dédié
- [ ] Suppression de compte (conformité données perso)

## Phase 7 — Administration

- [ ] Rôle admin + protection des routes admin
- [ ] Tableau de bord : stats globales (prix, contributeurs, fraîcheur)
- [ ] File de modération : prix `flagged` / `removed` / signalements
- [ ] Actions admin : rétablir, supprimer définitivement, bannir un utilisateur

## Phase 8 — Finition & lancement

- [ ] Tests des parcours critiques (OTP, ajout de prix, vote)
- [ ] Passe accessibilité (contrastes, labels, focus, cibles tactiles)
- [ ] Passe performance (poids des pages, lazy-loading images, test 3G)
- [ ] Intégration Sentry (suivi des erreurs)
- [ ] Politique de confidentialité + mentions
- [ ] Déploiement production (Vercel + Supabase Pro)
- [ ] Amorçage : recruter les premiers contributeurs, remplir les catégories clés

---

## Écrans restants à maquetter (design)

- [x] Recherche / résultats — `gabonprice-recherche.html`
- [x] Profil — `gabonprice-profil.html`
- [x] Mes contributions / historique — `gabonprice-mes-contributions.html`
- [x] Confirmation d'ajout — `gabonprice-confirmation.html`
- [x] Panel admin — `gabonprice-admin.html` (au format téléphone pour la cohérence ; à élargir en layout desktop — sidebar + tableau — au moment du code)

> ✅ Les 10 écrans sont maquettés.

---

## Décisions & journal

> Noter ici chaque décision importante (changement de stack, règle métier, etc.) avec la date.

- **Logo** : Option 1 « étiquette du Gabon » retenue.
- **Backend** : Chemin A (Supabase) retenu par défaut.
- **2026-07-09** : Frontend scaffoldé avec `npm create vite@latest` (React 19 + Vite 8 + TS). Tailwind en v4 (plugin `@tailwindcss/vite`, config via `@theme` dans `index.css`, plus de `tailwind.config.js`). Lint via `oxlint` (généré par défaut par le template Vite) plutôt qu'ESLint classique — plus rapide, mêmes garanties de base ; Prettier ajouté pour le format. Manifest PWA généré par `vite-plugin-pwa` (pas de `manifest.json` statique dupliqué). Routes de base posées (`/`, `/recherche`, `/produit/:id`, `/ajouter`, `/historique`, `/profil`, `/connexion`, `/verification`) avec pages placeholder à remplacer par les maquettes.
- **2026-07-09** : Projet Supabase `Gabon_price` (`vgczurwskvwmbyhstwku`, région eu-west-3) connecté. Schéma complet créé (6 tables, RLS sur toutes, triggers métier). Écart au cahier des charges : le recalcul de médiane/outlier/tendance et la logique karma/modération sont implémentés en **triggers Postgres** (`recalc_product_median`, `prices_set_outlier_flag`, `prices_after_insert/update/delete`, `handle_price_rating_change`) plutôt qu'en **Edge Functions Deno** — plus simple, atomique avec l'écriture (pas de risque de désynchro si l'edge function échoue après l'insert), et suffisant pour le volume attendu au MVP. Numéro de téléphone protégé : jamais exposé via l'API publique (colonnes accessibles à `anon`/`authenticated` limitées à `id, username, karma_score, level, preferred_province, created_at` par des `GRANT` colonne par colonne ; le téléphone n'est lisible que par son propriétaire via la fonction `get_my_profile()`). Rôle admin porté par `users.is_admin` (pas de table de rôles séparée, suffisant pour le MVP). Advisors sécurité/performance Supabase passés au vert (seuls des `INFO` "unused index" restent, normal sur base vide). Testé manuellement : profil auto-créé à l'inscription, karma (+10 prix, +2/-1 vote, -15 suppression), médiane/tendance/historique, détection d'outlier (>±60 %), escalade `active → flagged (3 votes nets)→ removed (5 votes nets)`. Types TypeScript générés dans `frontend/src/types/supabase.ts` et branchés sur le client (`createClient<Database>`).
- **2026-07-09** : Déploiement Vercel en production — projet `gabonprice` (org `Genycare projects` / `camaras-projects-6cb362bc`) : **https://gabonprice.vercel.app**. Déployé directement via l'outil `deploy_to_vercel` (upload de l'arborescence source, Vercel installe et build) plutôt que via import Git — pas de repo GitHub distant pour l'instant, donc pas encore de preview automatique par PR. Variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` injectées via un `.env.production` inclus dans le déploiement (la clé anonyme est conçue pour être publique côté client, protégée par les RLS). Blocage rencontré : le connecteur Vercel de Claude n'avait pas le scope de création de projet malgré le rôle Owner de l'utilisateur sur l'équipe (erreur 403) — résolu en réautorisant le connecteur depuis les paramètres. À faire plus tard : lier un repo GitHub pour activer preview automatique par PR + déploiement continu (`git push` → déploiement), au lieu du déploiement manuel actuel.
- **2026-07-09** : Repo poussé sur GitHub (`github.com/Genycare/gabonprice`, public) et lié au projet Vercel existant (`gabonprice`) via Project Settings → Git. Root Directory réglé sur `frontend`, variables `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` reconfigurées dans les Environment Variables du projet Vercel (celles injectées via `.env.production` lors du déploiement direct précédent ne s'appliquent pas aux builds Git). Connecter le repo ne déclenche pas de build automatiquement : un commit vide poussé sur `main` a servi de déclencheur pour le premier déploiement Git (`dpl_82cGCjRs7d1uQatomJai5WxobL2F`, `source: git`, READY). Déploiement continu maintenant actif : chaque push sur `main` déploie en prod, chaque PR aura une preview.
- **2026-07-09** : 5 écrans (accueil, détail produit, ajouter un prix, connexion, vérification OTP) réimplémentés en React + Tailwind d'après les maquettes HTML, sans le cadre « téléphone » factice (qui n'était qu'un artefact de présentation statique — l'app réelle occupe le viewport mobile réel). Fournisseur SMS : **Twilio** choisi à la place d'Infobip (décision utilisateur) — intégré via le provider Phone natif de Supabase Auth (`signInWithOtp` / `verifyOtp`), ce qui évite d'avoir à coder soi-même le rate-limiting, le hachage du code et l'expiration (gérés nativement par Supabase Auth) ; écart au cahier des charges qui mentionnait une Edge Function + Infobip. **Reste à faire côté utilisateur** : activer Twilio dans Supabase Dashboard → Authentication → Sign In / Providers → Phone (clés Twilio non configurables par API, doivent être saisies manuellement). Accueil/fiche produit/ajout de prix utilisent des données statiques (mock) fidèles aux maquettes — le branchement sur les vraies requêtes Supabase (lecture produits/prix, soumission du formulaire d'ajout, géolocalisation navigateur, upload photo) reste à faire.
- **2026-07-09** : Connexion/OTP alignées avec fidélité sur les maquettes HTML : image de hero réelle (photo du monument de l'Émergence, extraite du base64 des maquettes et servie depuis `public/hero/auth-hero.png`) au lieu d'un dégradé plat, carte flottante à coins arrondis avec marges (au lieu d'une feuille pleine largeur). Bug de débordement des 6 cases du code OTP sur mobile (390px) corrigé (`flex-1`+`aspect-square` remplacé par une grille `grid-cols-6`).
- **2026-07-09** : Phase 1 clôturée. Protection des routes ajoutée (`RequireAuth` + `useSession`, hook Supabase `getSession`/`onAuthStateChange`) : les 6 écrans applicatifs (`/`, `/recherche`, `/produit/:id`, `/ajouter`, `/historique`, `/profil`) redirigent vers `/connexion` si aucune session, testé (visite de `/` sans session → redirection immédiate vers `/connexion`). Plan WhatsApp OTP documenté (fast-follow, non implémenté).
- **2026-07-09** : Phase 2 clôturée. Seed réaliste inséré en base (11 produits couvrant les 8 catégories, 27 prix sur 4 provinces, historique 7j back-daté pour les tendances). Frontend branché sur Supabase pour de vrai : `lib/products.ts` centralise les requêtes (liste/recherche/filtre, détail produit, prix d'un produit avec contributeur, création/édition de prix). `SearchPage` (pas de maquette dédiée — UI construite dans le style existant, recherche full-text + filtre province/ville). `ProductDetailPage` affiche les vraies stats/prix triés et permet au propriétaire d'un prix de le modifier/supprimer. `AddPricePage` a maintenant un vrai sélecteur de produit (recherche live) et soumet réellement en base (mode création et édition via `?edit=<id>`), validé par Zod côté client + contraintes SQL côté serveur (prix positif, date pas dans le futur, champs non vides). Géolocalisation auto et upload photo restent non branchés (Phase 3, UI seulement). Testé : requêtes Supabase directes (recherche, filtre, tri, jointure contributeur) + rendu des 3 écrans en navigateur (contournement temporaire de `RequireAuth` en local pour le test visuel, retiré ensuite — aucune trace laissée dans le code).
- **2026-07-09** : ⚠️ Incident — le fichier `progress.md` (et le tableau des maquettes dans `cahier-des-charges.md`) avait été écrasé par un processus externe (probablement une session parallèle travaillant sur les maquettes) : toutes les cases à cocher étaient revenues à `[ ]` (y compris des tâches terminées depuis le tout début du projet) et 4 maquettes (`gabonprice-recherche.html`, `gabonprice-profil.html`, `gabonprice-mes-contributions.html`, `gabonprice-confirmation.html`) étaient marquées « présentes » alors qu'elles n'existent pas sur le disque — seul `gabonprice-admin.html` existe réellement. Reconstruit à partir de l'état réel du code/de la base + de l'historique Git, avec confirmation de l'utilisateur.
- **2026-07-09** : Les 4 maquettes manquantes créées (`gabonprice-recherche.html`, `gabonprice-profil.html`, `gabonprice-mes-contributions.html`, `gabonprice-confirmation.html`), dans le même système de design que les maquettes existantes (variables CSS partagées, conteneur `.phone`, topbar/bottom-nav identiques). Les 10 écrans du cahier des charges sont maintenant tous maquettés. `SearchPage.tsx` réalignée sur `gabonprice-recherche.html`. Écran de confirmation d'ajout implémenté (`ConfirmationPage.tsx`) et branché sur `AddPricePage` (uniquement à la création, pas à l'édition) ; testé en navigateur (rendu, navigation des deux boutons, garde-fou sur accès direct sans état). Profil et Mes contributions n'ont pas encore d'implémentation React (Phase 6).
- **2026-07-09** : Écran « Mes contributions » implémenté (`HistoryPage.tsx`), d'après `gabonprice-mes-contributions.html`. Seed enrichi avec un prix `flagged` et un `removed` pour tester les badges de statut. Testé en navigateur avec un contournement temporaire d'auth (retiré ensuite) : les prix `active` s'affichent bien (tabs, compteur, actions) ; les statuts `flagged`/`removed` n'ont **pas** pu être vérifiés visuellement — la RLS `prices_select_active_or_own_or_admin` (`status='active' OR user_id=auth.uid()`) ne renvoie que les prix actifs tant qu'il n'y a pas de vraie session authentifiée (le contournement ne fait qu'un faux objet côté React, les requêtes Supabase réelles restent anonymes). Le mapping des statuts dans le code a été relu mais reste à vérifier avec une vraie connexion.
- **2026-07-09** : Écran Profil implémenté (`ProfilePage.tsx`), d'après `gabonprice-profil.html`. Utilise la RPC `get_my_profile()` déjà en place (protège le téléphone, exécutable seulement par `authenticated`, confirmé par test direct : `permission denied` pour `anon`). Les 3 écrans identifiés comme manquants (Confirmation d'ajout, Mes contributions, Profil) sont maintenant tous implémentés en React. Limite de vérification à noter : ni ce test ni celui de `HistoryPage` n'ont pu être vérifiés en conditions réelles authentifiées (pas de moyen de générer une vraie session dans cet environnement) — à tester manuellement une fois connecté.
- **2026-07-09** : `ProductDetailPage` complétée — votes cliquables, signalement, badge outlier, lien « S'y rendre » (Google Maps). RLS vérifiées pour `price_ratings`/`price_reports` (insert/update/delete restreints au propriétaire du vote/signalement, lecture des votes publique, lecture des signalements restreinte à son auteur ou un admin). Un prix délibérément aberrant ajouté en base (12 000 F sur un produit à ~4 900 F médian) pour vérifier visuellement le badge « Prix inhabituel » — confirmé. Limite de test : le clic réel sur les boutons de vote/signalement n'a pas pu être vérifié de bout en bout (écriture en base) faute de session authentifiée disponible dans cet environnement ; la logique client (`lib/ratings.ts`) est simple et les triggers/RLS sous-jacents étaient déjà testés séparément.
- **2026-07-09** : Géolocalisation auto et upload photo implémentés sur `AddPricePage`, complétant la Phase 3. Bucket Supabase Storage `price-photos` créé (public, RLS par dossier `{user_id}/...`) ; un correctif de sécurité a été nécessaire juste après création (la policy SELECT initiale permettait de lister tous les fichiers du bucket public — retirée, la lecture directe par URL ne nécessite pas de policy SELECT sur un bucket public). Reverse-geocoding via Nominatim (OpenStreetMap, gratuit, sans clé) — limite d'usage à surveiller si le volume augmente, documenté dans le code. Testé en conditions réelles avec position simulée (Playwright + géolocalisation mockée) : la détection résout correctement Libreville/Estuaire ; l'aperçu photo et le bouton Retirer fonctionnent. Non testé : l'upload réel vers Supabase Storage (nécessite une session authentifiée, indisponible dans cet environnement) — la policy RLS d'écriture a été relue mais pas exercée en conditions réelles.
- _(ajouter les décisions au fil de l'eau)_
