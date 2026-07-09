# Cahier des charges — GabonPrice

> Plateforme collaborative de comparaison de prix au Gabon (PWA mobile-first)
> Version 1.2 — Document de référence produit & technique

> **📌 Pour Claude Code :** avant de coder **n'importe quel écran**, ouvrir et lire le **fichier HTML de maquette correspondant** (voir §5). Ces maquettes présentes dans le dossier du projet sont la **référence visuelle validée** : les reproduire fidèlement en React + Tailwind. Suivre l'ordre des tâches de `progress.md` et cocher chaque tâche terminée.

---

## 1. Vision & objectif

**GabonPrice** est une application web progressive (PWA) qui permet aux consommateurs gabonais de **consulter, comparer et partager les prix** des produits du quotidien, magasin par magasin, ville par ville. Les prix sont **alimentés par la communauté** : chaque utilisateur peut publier un prix qu'il a constaté, et la communauté vérifie leur fiabilité par des votes.

**Le problème résolu :** au Gabon, les prix varient fortement d'un magasin à l'autre et il n'existe pas de source fiable et à jour pour les comparer. Résultat : le consommateur paie souvent plus cher faute d'information.

**Ce que GabonPrice N'EST PAS :** ce n'est **pas** une plateforme de vente / e-commerce. Aucun paiement, aucune transaction. C'est un **comparateur d'information de prix**. Toute la copie et le design doivent refléter cela (pas de « achats sécurisés », etc.).

---

## 2. Utilisateurs cibles

| Persona | Description | Besoin principal |
|---|---|---|
| **Le consommateur** | Habitant urbain/péri-urbain, smartphone Android, budget serré | Trouver le moins cher avant d'acheter |
| **Le contributeur** | Utilisateur engagé qui publie régulièrement des prix | Reconnaissance (karma), utilité pour la communauté |
| **Le modérateur / admin** | Équipe GabonPrice | Garder la base fiable, retirer les faux prix |

---

## 3. Périmètre fonctionnel

### 3.1 MVP (à livrer en premier)

- **Authentification par téléphone (OTP)** : saisie du numéro `+241`, réception d'un code, vérification.
- **Recherche de produits** : par nom, par catégorie, avec filtre province/ville.
- **Fiche produit** : liste de tous les prix classés du moins cher au plus cher, avec statistiques (médian, min, tendance 7 jours).
- **Ajouter un prix** : produit + prix + magasin + localisation (géoloc auto + saisie manuelle) + date d'achat + photo du ticket (optionnelle).
- **Publication immédiate** : le prix est visible tout de suite (pas de file d'attente de validation).
- **Votes communautaires** : 👍 utile / 👎 pas utile sur chaque prix.
- **Signalement** d'un prix suspect.
- **Profil utilisateur** : score de karma, niveau, mes contributions.
- **Mode hors-ligne** : consultation des prix déjà chargés même sans réseau.

### 3.2 Post-MVP (phases suivantes)

- Historique de prix (graphiques d'évolution).
- Alertes de baisse de prix / promos.
- Gamification poussée (badges, classement des contributeurs).
- Notifications push (PWA).
- Panel d'administration complet + file de modération.
- WhatsApp OTP (alternative au SMS).
- Intégration Orange Money (si un jour un besoin de transaction apparaît — hors périmètre actuel).

---

## 4. Règles métier

### 4.1 Validation des prix (modèle UGC auto-validé)

- Un prix publié est **actif immédiatement** (visible par tous).
- La fiabilité est assurée **a posteriori** par la communauté, pas par une validation préalable.

### 4.2 Système de votes & modération automatique

- Chaque prix a un compteur de votes `utile` (+1) et `pas utile` (−1). Un utilisateur ne peut voter qu'une fois par prix.
- **3 votes négatifs nets** → le prix passe en statut `flagged` (signalé, moins visible).
- **5 votes négatifs nets** → le prix passe en statut `removed` (masqué), en attente de revue admin.
- Un admin peut **rétablir** (override) un prix à tout moment.

### 4.3 Détection d'aberrations (outliers)

- À chaque nouveau prix, recalculer le **prix médian** du produit.
- Un prix qui s'écarte trop de la médiane (ex. > ±60 %) est marqué `is_median_outlier = true` et signalé visuellement (« prix inhabituel »), sans être supprimé automatiquement.

### 4.4 Karma & niveaux

- Publier un prix : **+10 karma**. Recevoir un vote 👍 : **+2**. Recevoir un 👎 : **−1**. Prix `removed` : **−15**.
- Niveaux indicatifs : Débutant (0–99), Contributeur (100–499), Confirmé (500–1999), Expert (2000+).

### 4.5 Localisation

- Géolocalisation automatique **si disponible et autorisée**.
- **Fallback obligatoire** en cas d'échec : sélection manuelle Province → Ville → Quartier.
- Provinces couvertes au lancement : Estuaire (Libreville), Ogooué-Maritime (Port-Gentil), Haut-Ogooué (Franceville), Moyen-Ogooué (Lambaréné), Ngounié (Mouila).

---

## 5. Écrans (maquettes de référence)

> **⚠️ SOURCE VISUELLE DE VÉRITÉ — À LIRE AVANT DE CODER UN ÉCRAN.**
> Les fichiers **HTML de maquette** présents à la racine du projet (dossier `Gabon_price/`) sont la **référence visuelle officielle**. Avant d'implémenter un écran, Claude Code doit **ouvrir et lire le fichier `.html` correspondant** ci-dessous et reproduire fidèlement : mise en page, espacements, couleurs, typographie, composants, textes et interactions. Ne pas réinventer le design : ces maquettes sont validées.
> Les maquettes sont des prototypes statiques HTML/CSS ; il faut les **réimplémenter proprement en composants React + Tailwind** (pas de copier-coller brut), en respectant leur rendu.
>
> **⚠️ Contexte / fichiers lourds :** `gabonprice-login-ULTIMATE.html` (~2,4 Mo) et `gabonprice-otp-verification.html` (~1,5 Mo) contiennent l'image du monument encodée en base64. **Ne pas faire lire ces fichiers en entier à Claude Code** (risque de « prompt too long »). Pour ces deux écrans, se baser sur leur structure/CSS ou sur les autres maquettes légères ; idéalement, externaliser l'image dans `public/` et la référencer par son chemin.

| # | Écran | Fichier maquette (dans le dossier) | Statut |
|---|---|---|---|
| 1 | Connexion / Inscription (OTP) | `gabonprice-login-ULTIMATE.html` | ✅ Validé — présent |
| 2 | Vérification du code | `gabonprice-otp-verification.html` | ✅ Validé — présent |
| 3 | Accueil | `gabonprice-homepage.html` | ✅ Validé — présent |
| 4 | Détail produit | `gabonprice-detail-produit.html` | ✅ Validé — présent |
| 5 | Ajouter un prix | `gabonprice-ajouter-prix.html` | ✅ Validé — présent |
| 6 | Recherche / résultats | `gabonprice-recherche.html` | ✅ Validé — présent |
| 7 | Profil | `gabonprice-profil.html` | ✅ Validé — présent |
| 8 | Mes contributions / historique | `gabonprice-mes-contributions.html` | ✅ Validé — présent |
| 9 | Confirmation d'ajout | `gabonprice-confirmation.html` | ✅ Validé — présent |
| 10 | Panel admin | `gabonprice-admin.html` | ✅ Validé — présent (à élargir en layout desktop au moment du code) |

### 5.1 Logo & icônes (dossier `logo-gabonprice/`)

**Logo retenu :** Option 1 — « L'étiquette du Gabon » (étiquette de prix aux couleurs du drapeau).

| Usage | Fichier |
|---|---|
| Icône couleur (vectoriel, usage principal / favicon SVG) | `gabonprice-icon-color.svg` |
| Logo + nom + slogan (lockup) | `gabonprice-lockup.svg` |
| Favicons PNG | `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-64.png` |
| Icône PWA (manifest) | `icon-192.png`, `icon-512.png` |
| Icône PWA maskable (Android, zone de sécurité) | `maskable-512.png` |
| Icône iOS (écran d'accueil) | `apple-touch-icon-180.png` |
| Icône d'app fond dégradé | `appicon-gradient-512.png` |
| Aperçu de toutes les déclinaisons | `APERCU.png` |

**Fichiers d'intégration prêts à l'emploi (dans le même dossier) :**
- `manifest.json` — manifest PWA complet (couleurs de marque déjà réglées : `theme_color #157347`, `background_color #F4F6F5`, chemins d'icônes configurés).
- `INTEGRATION-PWA.md` — **guide d'intégration à suivre en Phase 0** : arborescence `public/icons/`, balises `<head>` prêtes à coller (favicons, apple-touch-icon, manifest, theme-color, Open Graph), et config `vite-plugin-pwa` avec cache offline-first.

> Utiliser en priorité les **SVG** (nets à toute taille). **⚠️ Ne pas déclarer le manifest deux fois** : soit `manifest.json` statique + `<link rel="manifest">`, soit génération par `vite-plugin-pwa` — jamais les deux. Recommandé pour Vite : le plugin (il gère aussi le service worker). Détails dans `INTEGRATION-PWA.md`.

**Design tokens :**
- Vert principal `#157347`, vert vif `#16A34A`, vert clair `#ECFDF5`
- Bleu `#1E3A8A` / `#1E40AF`, or `#FCD34D`
- Encre `#111827`, gris `#6B7280`, lignes `#E5E7EB`, fond `#F4F6F5`
- Police système (sans-serif), cards arrondies 16–22px, ombres douces.

---

## 6. Modèle de données

> Tables principales (PostgreSQL). Types indicatifs.

### `users`
| Champ | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| phone | text unique | format E.164 (+241...) |
| username | text | |
| karma_score | int | défaut 0 |
| level | text | calculé depuis karma |
| preferred_province | text | |
| is_banned | bool | défaut false |
| created_at | timestamptz | |

### `products`
| Champ | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| category | text | |
| search_vector | tsvector | index full-text |
| median_price | numeric | recalculé |
| price_trend_7d | numeric | % variation |
| created_at | timestamptz | |

### `prices`
| Champ | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| product_id | uuid (FK) | |
| user_id | uuid (FK) | |
| amount | numeric | en FCFA (XAF) |
| store_name | text | |
| province / city / neighborhood | text | |
| latitude / longitude | numeric | nullable (fallback manuel) |
| purchase_date | date | |
| photo_url | text | nullable |
| status | enum | active / flagged / removed |
| is_median_outlier | bool | |
| helpful_votes / unhelpful_votes | int | |
| created_at | timestamptz | |

### `price_ratings`
| Champ | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| price_id | uuid (FK) | contrainte UNIQUE (price_id, user_id) |
| user_id | uuid (FK) | |
| rating | int | +1 ou −1 |

### `price_reports`
| Champ | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| price_id | uuid (FK) | |
| user_id | uuid (FK) | |
| reason | text | |
| status | enum | pending / reviewed |

### `price_history`
| Champ | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| product_id | uuid (FK) | |
| median_price | numeric | |
| recorded_on | date | pour les graphiques d'évolution |

---

## 7. Stack technique recommandée

### Chemin A — recommandé (MVP rapide, moins de fournisseurs)

**Frontend**
- React 18 + **Vite 5** + **TypeScript**
- TailwindCSS 3
- TanStack Query (données serveur) + Zustand (état UI)
- React Hook Form + **Zod** (validation)
- Routing : React Router 6 (ou Wouter si on veut ultra-léger)
- PWA offline-first : `vite-plugin-pwa` (Workbox)
- Recherche hors-ligne : Lunr.js **sur sous-ensemble caché uniquement**
- Hébergement : **Vercel**

**Backend / Données : Supabase**
- PostgreSQL managé + Row Level Security (RLS)
- Storage pour les photos de tickets (avec transformation d'image intégrée → remplace Cloudinary)
- Session / JWT gérés par Supabase Auth
- Edge Functions (Deno) pour la logique métier : recalcul médiane, karma, transitions de statut
- Recherche : Postgres full-text (`tsvector`) en ligne

**Services externes**
- **Infobip** : OTP SMS `+241` (vérifier couverture & coût avant engagement ; prévoir WhatsApp OTP en fast-follow)
- **Sentry** : suivi des erreurs (free tier)
- Vercel Analytics

### Chemin B — alternative (plus de contrôle)

- Node.js 18+ + Express + **Prisma** (ORM) + PostgreSQL managé (Railway)
- Auth maison : JWT + hachage des codes OTP (bcryptjs)
- `sharp` pour le traitement d'images + Cloudinary pour le CDN
- Reste identique au Chemin A côté frontend

> **Décision par défaut : Chemin A.** Moins de code backend à écrire et maintenir, coûts réduits, Supabase déjà connecté. On bascule vers B seulement si un besoin de contrôle fin de l'API l'exige.

---

## 8. Architecture & principes

- **Offline-first** : l'app doit rester consultable sans réseau (cache des derniers prix vus). Écriture (ajout de prix) mise en file et synchronisée au retour du réseau.
- **Mobile-first** : conçu pour Android, écrans 5–6.5", 4G instable. Poids des pages minimal.
- **Images** : compression obligatoire côté client + serveur, **max 200 Ko** par photo de ticket.
- **Géolocalisation** : auto si possible, fallback manuel systématique.
- **Sécurité** : rate-limiting sur l'envoi d'OTP, validation Zod côté client ET serveur, RLS sur toutes les tables (un utilisateur ne modifie que ses propres contributions).

---

## 9. Sécurité & données personnelles

- Le seul identifiant personnel collecté est le **numéro de téléphone** → à protéger, ne jamais l'exposer publiquement (afficher un pseudo, pas le numéro).
- Rate-limiting strict sur l'endpoint OTP (ex. 1 code / 60s, 5 / heure / numéro) pour éviter l'abus et les coûts SMS.
- Codes OTP : courte durée de vie (ex. 5 min), usage unique, stockés hachés.
- RLS : lecture publique des prix `active` ; écriture/modification réservée au propriétaire ; actions admin réservées au rôle admin.
- Prévoir une politique de confidentialité simple (collecte, usage, suppression du compte).

---

## 10. Contraintes spécifiques Gabon

- Réseau 4G : ~80 % urbain, ~40 % en province, débits 3–5 Mbps, coupures fréquentes → offline-first indispensable.
- Parc majoritairement **Android** (Samsung, Tecno), écrans 5–6.5".
- **SMS OTP** = meilleure adoption (pas de culture e-mail), mais coût/fiabilité à surveiller → plan WhatsApp.
- Monnaie : **FCFA (XAF)**, pas de décimales dans l'affichage courant.
- Langue : **français**, copie simple et directe.

---

## 11. Qualité & performance (quality floor)

- Responsive jusqu'au mobile, focus clavier visible, `prefers-reduced-motion` respecté.
- Budget performance : première interaction rapide même en 3G ; images lazy-loadées.
- Accessibilité de base (contrastes, labels de formulaire, tailles de cible tactile).
- Tests : au minimum les parcours critiques (OTP, ajout de prix, vote).

---

## 12. Roadmap par phases

| Phase | Contenu | Durée indicative | Coût infra |
|---|---|---|---|
| **0 — Setup** | Repo, tooling, design system, hébergement, logo | ~1 sem | 0 (free tiers) |
| **1 — Auth** | Flux OTP complet (SMS) | ~1–2 sem | ~coût SMS |
| **2 — Données & API** | Modèle, CRUD produits/prix, recherche | ~2 sem | free/low |
| **3 — Écrans cœur** | Accueil, recherche, fiche produit, ajout prix | ~2–3 sem | low |
| **4 — Communauté** | Votes, karma, signalements, modération auto | ~2 sem | low |
| **5 — Offline/PWA** | Cache, file de sync, installabilité | ~1–2 sem | low |
| **6 — Profil & historique** | Profil, mes contributions, paramètres | ~1 sem | low |
| **7 — Admin** | Panel admin, file de modération | ~1–2 sem | low |
| **8 — Finition & lancement** | Tests, perf, accessibilité, déploiement | ~1–2 sem | ~Pro tier |

---

## 13. Budget indicatif (Chemin A)

Ordre de grandeur mensuel en production légère :
- Vercel : gratuit → ~20 $ si trafic
- Supabase : gratuit → 25 $ (Pro) une fois en prod
- Infobip SMS : variable selon volume (~0,03–0,05 $ / SMS) — poste le plus incertain
- Sentry : gratuit

> Le Chemin A réduit sensiblement le budget par rapport à la stack initiale (5 fournisseurs) en consolidant DB + stockage + auth dans Supabase.

---

## 14. Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Coût / fiabilité SMS OTP au Gabon | Élevé | Rate-limiting, tester Infobip tôt, plan WhatsApp OTP |
| Faux prix / spam | Moyen | Votes + karma + détection outliers + modération admin |
| Faible densité de données au début | Élevé | Amorcer avec quelques contributeurs actifs, catégories ciblées |
| Réseau instable | Élevé | Offline-first dès le MVP |
| Exposition du numéro de téléphone | Élevé | Pseudos publics, jamais le numéro |

---

## 15. Indicateurs de succès (KPI)

- Nombre de prix publiés / semaine.
- Nombre de contributeurs actifs.
- Fraîcheur moyenne des prix (âge médian d'un prix affiché).
- Taux de prix `removed` (santé de la modération).
- Rétention à 30 jours.

---

*Document vivant — à mettre à jour à chaque décision produit ou technique majeure.*
