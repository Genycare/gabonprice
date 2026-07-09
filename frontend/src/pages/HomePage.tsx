import { Link } from 'react-router-dom'

interface TrendCard {
  emoji: string
  name: string
  sub: string
  price: string
  trend: { direction: 'down' | 'up'; percent: string }
}

const TRENDING: TrendCard[] = [
  {
    emoji: '🍚',
    name: 'Riz parfumé 5kg',
    sub: 'Mbolo · il y a 2h',
    price: '4 500',
    trend: { direction: 'down', percent: '8%' },
  },
  {
    emoji: '🔥',
    name: 'Gaz 12,5 kg',
    sub: 'Cecado · il y a 5h',
    price: '6 800',
    trend: { direction: 'up', percent: '4%' },
  },
  {
    emoji: '🐔',
    name: 'Poulet entier',
    sub: 'Géant CKdo · 1h',
    price: '3 900',
    trend: { direction: 'down', percent: '5%' },
  },
]

const PROMOS = [
  {
    icon: '🛢️',
    title: 'Huile végétale 1L',
    text: (
      <>
        Baisse repérée à <b>Prix Import</b>, Akanda
      </>
    ),
    oldPrice: '1 700 FCFA',
    newPrice: '1 250 FCFA',
    gradient: 'from-brand-green to-brand-blue',
  },
  {
    icon: '🧱',
    title: 'Sac de ciment 50kg',
    text: (
      <>
        Meilleur prix ce mois à <b>Score</b>, Owendo
      </>
    ),
    oldPrice: '7 200 FCFA',
    newPrice: '6 100 FCFA',
    gradient: 'from-[#B45309] to-brand-green',
  },
]

const CATEGORIES = [
  { emoji: '🥖', label: 'Alimentaire' },
  { emoji: '🔥', label: 'Gaz & Énergie' },
  { emoji: '🧱', label: 'Construction' },
  { emoji: '🧴', label: 'Hygiène' },
  { emoji: '📱', label: 'Électronique' },
  { emoji: '💊', label: 'Pharmacie' },
  { emoji: '👕', label: 'Vêtements' },
  { emoji: '⛽', label: 'Carburant' },
]

export function HomePage() {
  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-line bg-white px-4.5 pb-3.5 pt-4">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8.5 w-8.5 rounded-lg"
              style={{
                background:
                  'conic-gradient(from 45deg, #FCD34D 0deg 90deg, #16A34A 90deg 180deg, #1E3A8A 180deg 270deg, #3B82F6 270deg 360deg)',
                WebkitMaskImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C7 2 3 5 3 9c0 3 2 5 4 7l5 6 5-6c2-2 4-4 4-7 0-4-4-7-9-7z'/%3E%3C/svg%3E\")",
                maskImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C7 2 3 5 3 9c0 3 2 5 4 7l5 6 5-6c2-2 4-4 4-7 0-4-4-7-9-7z'/%3E%3C/svg%3E\")",
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
            />
            <div className="text-xl font-extrabold tracking-tight text-brand-blue">
              Gabon<span className="text-brand-green-vivid">Price</span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-full bg-brand-green-light px-3 py-2 text-sm font-bold text-brand-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Libreville
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-app-bg px-3.5 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5 flex-shrink-0 text-muted">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit, un magasin..."
            className="flex-1 border-none bg-transparent text-[15px] text-ink placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </div>
      </header>

      <section className="px-4.5 pt-5.5">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold text-ink">
            <span>🔥</span> Tendances du jour
          </h2>
          <Link to="/recherche" className="text-sm font-bold text-brand-green-vivid">
            Tout voir
          </Link>
        </div>
        <div className="-mx-4.5 flex gap-3 overflow-x-auto px-4.5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRENDING.map((item) => (
            <div key={item.name} className="min-w-[165px] flex-shrink-0 rounded-card-lg border border-line bg-white p-3.5 shadow-sm">
              <div className="mb-2.5 flex h-11.5 w-11.5 items-center justify-center rounded-xl bg-brand-green-light text-2xl">
                {item.emoji}
              </div>
              <div className="mb-0.5 text-sm font-bold leading-tight text-ink">{item.name}</div>
              <div className="mb-2.5 text-[11px] text-muted">{item.sub}</div>
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-extrabold text-brand-green">
                  {item.price} <small className="text-[11px] font-semibold text-muted">FCFA</small>
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    item.trend.direction === 'down' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                  }`}
                >
                  {item.trend.direction === 'down' ? '▼' : '▲'} {item.trend.percent}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4.5 pt-5.5">
        <h2 className="mb-3.5 flex items-center gap-1.5 text-[17px] font-extrabold text-ink">
          <span>🏷️</span> Promos détectées
        </h2>
        <div className="flex flex-col gap-2.5">
          {PROMOS.map((promo) => (
            <div
              key={promo.title}
              className={`flex items-center gap-3.5 rounded-card-lg bg-gradient-to-r p-4 text-white ${promo.gradient}`}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.18] text-[26px]">
                {promo.icon}
              </div>
              <div className="flex-1">
                <div className="mb-0.5 text-[15px] font-extrabold">{promo.title}</div>
                <div className="text-xs leading-snug opacity-90">{promo.text}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70 line-through">{promo.oldPrice}</div>
                <div className="text-lg font-extrabold">{promo.newPrice}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4.5 py-5.5">
        <h2 className="mb-3.5 flex items-center gap-1.5 text-[17px] font-extrabold text-ink">
          <span>🗂️</span> Catégories
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className="rounded-2xl border border-line bg-white px-1.5 py-3.5 text-center transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="mb-1.5 block text-[26px]">{cat.emoji}</span>
              <span className="text-[11px] font-semibold text-ink">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
