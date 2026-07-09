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
- [ ] Écran de connexion : saisie du numéro `+241` avec formatage
- [ ] Endpoint / fonction d'envoi du code OTP (intégration Infobip)
- [ ] **Rate-limiting** sur l'envoi d'OTP (1/60s, 5/h par numéro)
- [ ] Stockage du code haché + expiration (5 min, usage unique)
- [ ] Écran de vérification : 6 cases, auto-focus, renvoi avec minuteur
- [ ] Vérification du code + création/connexion de l'utilisateur + session
- [ ] Gestion des erreurs (code faux, expiré, trop de tentatives)
- [ ] Redirection post-connexion vers l'accueil
- [ ] (Fast-follow) Plan WhatsApp OTP documenté

## Phase 2 — Modèle de données & API

- [x] Créer les tables `products`, `prices`, `price_ratings`, `price_reports`, `price_history`
- [x] Index full-text (`tsvector`) sur `products` (config `french`, trigger de maintenance auto)
- [x] RLS sur toutes les tables (lecture publique des prix `active`, écriture = propriétaire, admin = rôle) — advisors sécurité/perf Supabase passés au propre
- [ ] Seed de données réalistes (produits + magasins + quelques prix de test)
- [ ] Lecture des produits (liste, recherche, filtre province/ville) — côté frontend (query TanStack)
- [ ] Lecture des prix d'un produit (triés du moins cher au plus cher) — côté frontend
- [ ] Création d'un prix (validation Zod côté serveur) — formulaire côté frontend (RLS déjà en place)
- [ ] Édition / suppression d'un prix par son propriétaire — côté frontend (RLS déjà en place)
- [x] Recalcul du `median_price` + `is_median_outlier` à chaque nouveau prix — implémenté en triggers Postgres (`recalc_product_median`, `prices_set_outlier_flag`) plutôt qu'en Edge Function : plus fiable (atomique avec l'écriture), pas de latence réseau supplémentaire
- [x] Mise à jour de `price_trend_7d` et `price_history` — même trigger `recalc_product_median`, testé manuellement (karma, médiane, outlier, transitions `flagged`/`removed`, karma -15)

## Phase 3 — Écrans cœur

- [ ] **Accueil** : header + sélecteur de province + recherche
- [ ] Accueil : section « Tendances du jour » (scroll horizontal)
- [ ] Accueil : section « Promos détectées »
- [ ] Accueil : grille de catégories
- [ ] Barre de navigation basse (Accueil / Chercher / Ajouter / Historique / Profil)
- [ ] **Recherche / résultats** : champ + filtres province/ville + tri
- [ ] **Fiche produit** : stats (médian, min, tendance) + liste des prix
- [ ] Fiche produit : badge « meilleur prix », localisation, contributeur + karma, date, photo
- [ ] Bouton « S'y rendre » (ouvre l'itinéraire vers le magasin)
- [ ] **Ajouter un prix** : sélection produit + prix + magasin
- [ ] Ajouter un prix : géolocalisation auto + fallback manuel (Province → Ville → Quartier)
- [ ] Ajouter un prix : date d'achat + upload photo (compression < 200 Ko)
- [ ] **Confirmation d'ajout** (écran de succès)

## Phase 4 — Communauté & modération

- [x] Votes 👍 / 👎 sur un prix (contrainte 1 vote / utilisateur / prix) — table `price_ratings` + trigger, UI à faire (Phase 3)
- [x] Transitions de statut auto : 3 votes négatifs → `flagged`, 5 → `removed` — trigger `handle_price_rating_change`, testé (escalade flagged→removed vérifiée)
- [ ] Signalement d'un prix (raison + statut `pending`) — table `price_reports` prête, formulaire UI à faire
- [x] Calcul et attribution du karma (publier +10, 👍 +2, 👎 −1, prix retiré −15) — triggers Postgres, testé
- [ ] Affichage du niveau utilisateur d'après le karma — calcul auto en base (`compute_user_level`), affichage UI à faire
- [ ] Marquage visuel des prix `outlier` (« prix inhabituel ») — flag calculé en base (`is_median_outlier`), affichage UI à faire

## Phase 5 — Offline & PWA

- [ ] Configurer `vite-plugin-pwa` (manifest + service worker) — voir la config prête dans `INTEGRATION-PWA.md`
- [ ] Cache des derniers prix/produits consultés (offline read)
- [ ] File d'attente d'écriture (ajout de prix hors-ligne) + sync au retour réseau
- [ ] Recherche hors-ligne Lunr.js sur sous-ensemble caché
- [ ] Bannière / indicateur d'état réseau (en ligne / hors-ligne)
- [ ] Rendre l'app installable (icônes, splash, test sur Android)

## Phase 6 — Profil, contributions, paramètres

- [ ] **Profil** : pseudo, karma, niveau, stats
- [ ] **Mes contributions** : historique des prix publiés, éditer / supprimer
- [ ] **Paramètres** : province préférée, gestion du compte, déconnexion
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

- [ ] Recherche / résultats
- [ ] Profil
- [ ] Mes contributions / historique
- [ ] Confirmation d'ajout
- [ ] Panel admin

---

## Décisions & journal

> Noter ici chaque décision importante (changement de stack, règle métier, etc.) avec la date.

- **Logo** : Option 1 « étiquette du Gabon » retenue.
- **Backend** : Chemin A (Supabase) retenu par défaut.
- **2026-07-09** : Frontend scaffoldé avec `npm create vite@latest` (React 19 + Vite 8 + TS). Tailwind en v4 (plugin `@tailwindcss/vite`, config via `@theme` dans `index.css`, plus de `tailwind.config.js`). Lint via `oxlint` (généré par défaut par le template Vite) plutôt qu'ESLint classique — plus rapide, mêmes garanties de base ; Prettier ajouté pour le format. Manifest PWA généré par `vite-plugin-pwa` (pas de `manifest.json` statique dupliqué). Routes de base posées (`/`, `/recherche`, `/produit/:id`, `/ajouter`, `/historique`, `/profil`, `/connexion`, `/verification`) avec pages placeholder à remplacer par les maquettes.
- **2026-07-09** : Projet Supabase `Gabon_price` (`vgczurwskvwmbyhstwku`, région eu-west-3) connecté. Schéma complet créé (6 tables, RLS sur toutes, triggers métier). Écart au cahier des charges : le recalcul de médiane/outlier/tendance et la logique karma/modération sont implémentés en **triggers Postgres** (`recalc_product_median`, `prices_set_outlier_flag`, `prices_after_insert/update/delete`, `handle_price_rating_change`) plutôt qu'en **Edge Functions Deno** — plus simple, atomique avec l'écriture (pas de risque de désynchro si l'edge function échoue après l'insert), et suffisant pour le volume attendu au MVP. Numéro de téléphone protégé : jamais exposé via l'API publique (colonnes accessibles à `anon`/`authenticated` limitées à `id, username, karma_score, level, preferred_province, created_at` par des `GRANT` colonne par colonne ; le téléphone n'est lisible que par son propriétaire via la fonction `get_my_profile()`). Rôle admin porté par `users.is_admin` (pas de table de rôles séparée, suffisant pour le MVP). Advisors sécurité/performance Supabase passés au vert (seuls des `INFO` "unused index" restent, normal sur base vide). Testé manuellement : profil auto-créé à l'inscription, karma (+10 prix, +2/-1 vote, -15 suppression), médiane/tendance/historique, détection d'outlier (>±60 %), escalade `active → flagged (3 votes nets)→ removed (5 votes nets)`. Types TypeScript générés dans `frontend/src/types/supabase.ts` et branchés sur le client (`createClient<Database>`).
- **2026-07-09** : Déploiement Vercel en production — projet `gabonprice` (org `Genycare projects` / `camaras-projects-6cb362bc`) : **https://gabonprice.vercel.app**. Déployé directement via l'outil `deploy_to_vercel` (upload de l'arborescence source, Vercel installe et build) plutôt que via import Git — pas de repo GitHub distant pour l'instant, donc pas encore de preview automatique par PR. Variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` injectées via un `.env.production` inclus dans le déploiement (la clé anonyme est conçue pour être publique côté client, protégée par les RLS). Blocage rencontré : le connecteur Vercel de Claude n'avait pas le scope de création de projet malgré le rôle Owner de l'utilisateur sur l'équipe (erreur 403) — résolu en réautorisant le connecteur depuis les paramètres. À faire plus tard : lier un repo GitHub pour activer preview automatique par PR + déploiement continu (`git push` → déploiement), au lieu du déploiement manuel actuel.
- **2026-07-09** : Repo poussé sur GitHub (`github.com/Genycare/gabonprice`, public) et lié au projet Vercel existant (`gabonprice`) via Project Settings → Git. Root Directory réglé sur `frontend`, variables `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` reconfigurées dans les Environment Variables du projet Vercel (celles injectées via `.env.production` lors du déploiement direct précédent ne s'appliquent pas aux builds Git). Connecter le repo ne déclenche pas de build automatiquement : un commit vide poussé sur `main` a servi de déclencheur pour le premier déploiement Git (`dpl_82cGCjRs7d1uQatomJai5WxobL2F`, `source: git`, READY). Déploiement continu maintenant actif : chaque push sur `main` déploie en prod, chaque PR aura une preview.
- _(ajouter les décisions au fil de l'eau)_
