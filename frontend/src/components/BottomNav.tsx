import { NavLink } from 'react-router-dom'

const SIDE_ITEMS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/recherche', label: 'Chercher', end: false },
] as const

const SIDE_ITEMS_RIGHT = [
  { to: '/historique', label: 'Historique', end: false },
  { to: '/profil', label: 'Profil', end: false },
] as const

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const ICONS = { Accueil: HomeIcon, Chercher: SearchIcon, Historique: HistoryIcon, Profil: ProfileIcon }

function NavTab({ to, label, end }: { to: string; label: keyof typeof ICONS; end: boolean }) {
  const Icon = ICONS[label]
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold ${
          isActive ? 'text-brand-green-vivid' : 'text-muted'
        }`
      }
    >
      <Icon className="h-5.5 w-5.5" />
      {label}
    </NavLink>
  )
}

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex items-center border-t border-line bg-white/95 backdrop-blur"
      aria-label="Navigation principale"
    >
      {SIDE_ITEMS.map((item) => (
        <NavTab key={item.to} to={item.to} label={item.label} end={item.end} />
      ))}

      <NavLink
        to="/ajouter"
        aria-label="Ajouter un prix"
        className="-mt-7 flex h-13.5 w-13.5 flex-none items-center justify-center rounded-full border-4 border-white bg-brand-green-vivid text-white shadow-[0_8px_16px_-4px_rgba(22,163,74,0.55)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="h-6 w-6">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </NavLink>

      {SIDE_ITEMS_RIGHT.map((item) => (
        <NavTab key={item.to} to={item.to} label={item.label} end={item.end} />
      ))}
    </nav>
  )
}
