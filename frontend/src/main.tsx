import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { queryClient } from './lib/queryClient'

// Une PWA installée reste ouverte longtemps : sans rechargement forcé au
// prochain déploiement, elle peut continuer à exécuter un vieux bundle JS
// indéfiniment. skipWaiting/clientsClaim (vite.config.ts) permettent au
// nouveau service worker de prendre la main immédiatement ; ce reload fait
// en sorte que la page en cours en profite tout de suite plutôt qu'à la
// prochaine ouverture.
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload()
  },
})

persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({ storage: window.localStorage, key: 'gabonprice:query-cache' }),
  maxAge: 24 * 60 * 60 * 1000,
  buster: __APP_BUILD__,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
