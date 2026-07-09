# GabonPrice

Plateforme collaborative de comparaison de prix au Gabon (PWA mobile-first).

Voir [`cahier-des-charges.md`](./cahier-des-charges.md) pour la spécification produit/technique complète et [`progress.md`](./progress.md) pour le suivi d'avancement.

## Structure

- `frontend/` — application React + Vite + TypeScript + Tailwind (PWA)
- `*.html` — maquettes de référence pour les écrans (voir cahier des charges §5)
- `logo-gabonprice/` (fichiers à la racine) — logo, icônes PWA, `manifest.json`, guide `INTEGRATION-PWA.md`

## Démarrer

```bash
cd frontend
npm install
cp .env.example .env   # renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

## Scripts (`frontend/`)

- `npm run dev` — serveur de développement
- `npm run build` — build de production (typecheck + Vite build + PWA)
- `npm run lint` — lint (oxlint)
- `npm run format` — formatage (Prettier)
