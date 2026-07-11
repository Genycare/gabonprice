import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { OfflineBanner } from './components/OfflineBanner'
import { IosInstallPrompt } from './components/IosInstallPrompt'
import { RequireAuth } from './components/RequireAuth'
import { RequireAdmin } from './components/RequireAdmin'
import { syncOfflinePrices } from './lib/offlineQueue'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const AddPricePage = lazy(() => import('./pages/AddPricePage').then((m) => ({ default: m.AddPricePage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const OtpVerificationPage = lazy(() =>
  import('./pages/OtpVerificationPage').then((m) => ({ default: m.OtpVerificationPage })),
)
const ConfirmationPage = lazy(() =>
  import('./pages/ConfirmationPage').then((m) => ({ default: m.ConfirmationPage })),
)
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })),
)
const LegalNoticePage = lazy(() =>
  import('./pages/LegalNoticePage').then((m) => ({ default: m.LegalNoticePage })),
)

const ROUTES_WITHOUT_NAV = ['/connexion', '/verification', '/confirmation', '/admin', '/confidentialite', '/mentions-legales']

function App() {
  const location = useLocation()
  const showBottomNav = !ROUTES_WITHOUT_NAV.includes(location.pathname)

  useEffect(() => {
    syncOfflinePrices()
    const handleOnline = () => syncOfflinePrices()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return (
    <div className={showBottomNav ? 'pb-16' : ''}>
      <OfflineBanner />
      <IosInstallPrompt />
      <main>
        <Suspense fallback={<div className="flex min-h-svh items-center justify-center text-sm text-muted">Chargement...</div>}>
          <Routes>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/verification" element={<OtpVerificationPage />} />
            <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
            <Route path="/mentions-legales" element={<LegalNoticePage />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/recherche" element={<SearchPage />} />
              <Route path="/produit/:id" element={<ProductDetailPage />} />
              <Route path="/ajouter" element={<AddPricePage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/historique" element={<HistoryPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/parametres" element={<SettingsPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default App
