import { Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { RequireAuth } from './components/RequireAuth'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { AddPricePage } from './pages/AddPricePage'
import { HistoryPage } from './pages/HistoryPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { LoginPage } from './pages/LoginPage'
import { OtpVerificationPage } from './pages/OtpVerificationPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { SettingsPage } from './pages/SettingsPage'

const ROUTES_WITHOUT_NAV = ['/connexion', '/verification', '/confirmation']

function App() {
  const location = useLocation()
  const showBottomNav = !ROUTES_WITHOUT_NAV.includes(location.pathname)

  return (
    <div className={showBottomNav ? 'pb-16' : ''}>
      <Routes>
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/verification" element={<OtpVerificationPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recherche" element={<SearchPage />} />
          <Route path="/produit/:id" element={<ProductDetailPage />} />
          <Route path="/ajouter" element={<AddPricePage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/historique" element={<HistoryPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/parametres" element={<SettingsPage />} />
        </Route>
      </Routes>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default App
