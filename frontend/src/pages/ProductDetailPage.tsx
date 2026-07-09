import { Link } from 'react-router-dom'

interface PriceEntry {
  id: string
  storeIcon: string
  storeName: string
  location: string
  price: string
  best?: boolean
  contributorName: string
  karma: number
  dateLabel: string
  upvotes: number
  downvotes: number
}

const PRICES: PriceEntry[] = [
  {
    id: '1',
    storeIcon: '🏬',
    storeName: 'Mbolo',
    location: 'Libreville · Glass',
    price: '4 500',
    best: true,
    contributorName: 'Jean-Paul M.',
    karma: 340,
    dateLabel: 'Acheté le 6 juil. · publié il y a 2h',
    upvotes: 24,
    downvotes: 1,
  },
  {
    id: '2',
    storeIcon: '🏪',
    storeName: 'Cecado',
    location: 'Libreville · Nombakélé',
    price: '4 900',
    contributorName: 'Aline B.',
    karma: 128,
    dateLabel: 'Acheté le 5 juil. · publié hier',
    upvotes: 11,
    downvotes: 0,
  },
  {
    id: '3',
    storeIcon: '🛒',
    storeName: 'Score',
    location: 'Owendo · Centre',
    price: '5 500',
    contributorName: 'Serge O.',
    karma: 76,
    dateLabel: 'Acheté le 3 juil. · publié il y a 3j',
    upvotes: 6,
    downvotes: 2,
  },
]

function PriceCard({ entry }: { entry: PriceEntry }) {
  return (
    <div className={`rounded-card-lg border bg-white p-4 shadow-sm ${entry.best ? 'border-2 border-brand-green-vivid' : 'border-line'}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10.5 w-10.5 items-center justify-center rounded-[11px] border border-line bg-app-bg text-xl">
            {entry.storeIcon}
          </div>
          <div>
            <div className="text-[15px] font-bold text-ink">{entry.storeName}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-2.75 w-2.75">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {entry.location}
            </div>
          </div>
        </div>
        <div className="text-right">
          {entry.best && (
            <div className="mb-1.5 inline-flex items-center gap-0.5 rounded-full bg-brand-green-vivid px-2 py-0.5 text-[10px] font-extrabold text-white">
              ✓ MEILLEUR PRIX
            </div>
          )}
          <div className="text-xl font-extrabold leading-none text-brand-green">
            {entry.price}
            <small className="text-[11px] font-semibold text-muted"> F</small>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2.5 border-y border-line py-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] text-xl">
          🧾
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
            {entry.contributorName}{' '}
            <span className="rounded-full bg-[#FEF3C7] px-1.5 py-px text-[10px] font-extrabold text-[#B45309]">
              ★ {entry.karma}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted">{entry.dateLabel}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-[10px] border border-line bg-app-bg px-3 py-1.75 text-sm font-bold text-muted hover:border-brand-green-vivid hover:text-brand-green-vivid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.75 w-3.75">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
              <line x1="7" y1="22" x2="7" y2="11" />
            </svg>
            {entry.upvotes}
          </button>
          <button className="flex items-center gap-1.5 rounded-[10px] border border-line bg-app-bg px-3 py-1.75 text-sm font-bold text-muted hover:border-[#FCA5A5] hover:text-[#B91C1C]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.75 w-3.75">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z" />
              <line x1="17" y1="2" x2="17" y2="13" />
            </svg>
            {entry.downvotes}
          </button>
        </div>
        {!entry.best && (
          <button className="ml-auto flex items-center gap-1 text-xs text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            Signaler
          </button>
        )}
        <button className={`flex items-center gap-1.5 rounded-[10px] bg-brand-green px-3.5 py-2 text-sm font-bold text-white ${entry.best ? 'ml-auto' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          S'y rendre
        </button>
      </div>
    </div>
  )
}

export function ProductDetailPage() {
  return (
    <div>
      <div className="sticky top-0 z-40 flex items-center gap-3.5 border-b border-line bg-white px-4.5 py-4">
        <Link
          to="/"
          className="flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-app-bg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-ink">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="flex-1 text-[17px] font-extrabold text-ink">Détail du produit</div>
        <button className="flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-app-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.75 w-4.75 text-muted">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>

      <div className="border-b border-line bg-white px-4.5 pb-5.5 pt-5">
        <div className="mb-4.5 flex items-start gap-4">
          <div className="flex h-20.5 w-20.5 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-green-light text-[42px]">
            🍚
          </div>
          <div className="flex-1">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-green-vivid">Alimentaire</div>
            <div className="mb-1.5 text-xl font-extrabold leading-tight text-ink">Riz parfumé 5 kg</div>
            <div className="text-xs text-muted">18 prix relevés · 5 magasins</div>
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1 rounded-2xl border border-line bg-app-bg p-3 text-center">
            <div className="mb-1 text-[11px] font-semibold text-muted">Prix médian</div>
            <div className="text-[17px] font-extrabold text-ink">
              5 200<small className="text-[11px]"> F</small>
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-line bg-app-bg p-3 text-center">
            <div className="mb-1 text-[11px] font-semibold text-muted">Le moins cher</div>
            <div className="text-[17px] font-extrabold text-brand-green">
              4 500<small className="text-[11px]"> F</small>
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-line bg-app-bg p-3 text-center">
            <div className="mb-1 text-[11px] font-semibold text-muted">Tendance 7j</div>
            <div className="text-[17px] font-extrabold text-ink">▼</div>
            <div className="mt-0.5 text-xs font-bold text-[#15803D]">-6%</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4.5 pb-3 pt-5">
        <div className="text-base font-extrabold text-ink">Tous les prix</div>
        <button className="flex items-center gap-1.25 rounded-full bg-brand-green-light px-3 py-1.5 text-xs font-bold text-brand-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-3.25 w-3.25">
            <line x1="12" y1="20" x2="12" y2="10" />
            <polyline points="6 14 12 20 18 14" />
          </svg>
          Moins cher
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4.5 pb-6">
        {PRICES.map((entry) => (
          <PriceCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
