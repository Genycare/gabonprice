# PROGRESS — GabonPrice

> Suivi d'avancement du projet. **Claude Code coche `[x]` chaque tâche terminée.**
> Convention : `[ ]` à faire · `[~]` en cours · `[x]` fait.
> Se réfère au `cahier-des-charges.md`.

**Stack retenue :** Chemin A (Vercel + Supabase + Infobip) · **Logo :** Option 1 (étiquette).

---

## Phase 0 — Setup du projet

- [ ] Créer le dépôt Git (mono-repo ou front/back séparés) + README
- [x] Initialiser le frontend : Vite + React + **TypeScript** (`frontend/`, React 19 + Vite 8 + TS strict)
- [x] Configurer TailwindCSS avec les design tokens du cahier des charges (Tailwind v4 via `@tailwindcss/vite`, tokens dans `src/index.css`)
- [x] Installer les libs de base : TanStack Query, Zustand, React Hook Form, Zod, React Router
- [x] Mettre en place ESLint + Prettier + config TS stricte (oxlint + `.oxlintrc.json`, `.prettierrc.json`, `strict: true`)
- [ ] Créer le projet Supabase et récupérer les clés (`.env`, ne jamais commiter) — `.env.example` prêt, clés à fournir
- [ ] Configurer le déploiement Vercel (preview + prod)
- [x] Copier `logo-gabonprice/` dans `public/` (icônes + `manifest.json`) et intégrer le `<head>` en suivant `INTEGRATION-PWA.md` (logo Option 1, favicons, icônes PWA) — manifest géré par `vite-plugin-pwa` (pas de doublon statique)
- [x] Poser la structure de dossiers (composants, pages, hooks, lib, types)
- [x] Créer les composants UI réutilisables de base (Button, Input, Card, BottomNav)

## Phase 1 — Authentification (OTP)

- [ ] Créer la table `users` + RLS
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

- [ ] Créer les tables `products`, `prices`, `price_ratings`, `price_reports`, `price_history`
- [ ] Index full-text (`tsvector`) sur `products`
- [ ] RLS sur toutes les tables (lecture publique des prix `active`, écriture = propriétaire, admin = rôle)
- [ ] Seed de données réalistes (produits + magasins + quelques prix de test)
- [ ] Lecture des produits (liste, recherche, filtre province/ville)
- [ ] Lecture des prix d'un produit (triés du moins cher au plus cher)
- [ ] Création d'un prix (validation Zod côté serveur)
- [ ] Édition / suppression d'un prix par son propriétaire
- [ ] Edge Function : recalcul du `median_price` + `is_median_outlier` à chaque nouveau prix
- [ ] Edge Function : mise à jour de `price_trend_7d` et `price_history`

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

- [ ] Votes 👍 / 👎 sur un prix (contrainte 1 vote / utilisateur / prix)
- [ ] Transitions de statut auto : 3 votes négatifs → `flagged`, 5 → `removed`
- [ ] Signalement d'un prix (raison + statut `pending`)
- [ ] Calcul et attribution du karma (publier, votes reçus, prix retiré)
- [ ] Affichage du niveau utilisateur d'après le karma
- [ ] Marquage visuel des prix `outlier` (« prix inhabituel »)

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
- _(ajouter les décisions au fil de l'eau)_
