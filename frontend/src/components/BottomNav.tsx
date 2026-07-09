import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil' },
  { to: '/recherche', label: 'Chercher' },
  { to: '/ajouter', label: 'Ajouter' },
  { to: '/historique', label: 'Historique' },
  { to: '/profil', label: 'Profil' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-white/95 backdrop-blur"
      aria-label="Navigation principale"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium ${
              isActive ? 'text-brand-green' : 'text-muted'
            }`
          }
        >
          <span
            className="h-2 w-2 rounded-full bg-current"
            aria-hidden="true"
          />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
