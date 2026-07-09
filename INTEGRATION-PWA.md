# Intégration du logo & PWA — GabonPrice

Guide prêt à coller. Deux parties : (A) où mettre les fichiers, (B) les balises `<head>`.

---

## A. Où placer les fichiers

Dans un projet **Vite / React**, mets les icônes dans le dossier `public/` :

```
public/
├── icons/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   ├── icon-64.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── maskable-512.png
│   └── apple-touch-icon-180.png
├── favicon.svg          ← copie de gabonprice-icon-color.svg (renommée)
└── manifest.json        ← le manifest fourni
```

> `favicon.svg` = le fichier `gabonprice-icon-color.svg` renommé. Le SVG en favicon est net sur tous les écrans modernes ; les PNG servent de repli.

Tout ce qui est dans `public/` est servi à la racine du site (ex. `public/icons/icon-192.png` → `/icons/icon-192.png`). Les chemins du `manifest.json` sont déjà écrits pour cette structure.

---

## B. Balises à coller dans le `<head>`

À placer dans `index.html` (Vite) entre `<head>` et `</head>` :

```html
<!-- Encodage & viewport (mobile-first) -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

<!-- Titre & description -->
<title>GabonPrice — Le prix juste, partout au Gabon</title>
<meta name="description" content="Comparez les prix au Gabon. Des prix partagés par la communauté, magasin par magasin." />

<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />

<!-- Icône iOS (écran d'accueil) -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />

<!-- PWA -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#157347" />

<!-- iOS : mode plein écran quand ajouté à l'accueil -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="GabonPrice" />

<!-- Partage (Open Graph) — optionnel mais recommandé -->
<meta property="og:title" content="GabonPrice" />
<meta property="og:description" content="Comparez les prix au Gabon, partagés par la communauté." />
<meta property="og:type" content="website" />
<meta property="og:image" content="/icons/icon-512.png" />
```

---

## C. Activer la PWA avec Vite (recommandé)

Plutôt que d'écrire le service worker à la main, utilise le plugin officiel :

```bash
npm install -D vite-plugin-pwa
```

Dans `vite.config.ts` :

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon-180.png"],
      manifest: {
        name: "GabonPrice",
        short_name: "GabonPrice",
        description: "Comparez les prix au Gabon, partagés par la communauté.",
        lang: "fr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F4F6F5",
        theme_color: "#157347",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Cache offline-first (essentiel pour le réseau au Gabon)
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: { cacheName: "images", expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ]
});
```

> Avec `vite-plugin-pwa`, tu peux laisser le plugin générer le manifest (bloc ci-dessus) **ou** garder ton `manifest.json` statique dans `public/` — ne fais pas les deux pour éviter les doublons. Si tu utilises le plugin, retire `<link rel="manifest">` et le `manifest.json` statique.

---

## Récap des couleurs de marque (rappel)

| Rôle | Hex |
|---|---|
| Vert principal (theme_color) | `#157347` |
| Vert vif | `#16A34A` |
| Bleu | `#1E3A8A` |
| Or (drapeau) | `#FCD34D` |
| Fond app (background_color) | `#F4F6F5` |
