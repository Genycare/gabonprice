import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '../lib/products'
import { CATEGORY_EMOJI, categoryEmoji } from '../lib/categories'
import { formatFcfa } from '../lib/format'

export function HomePage() {
  const { data: products } = useQuery({ queryKey: ['products', {}], queryFn: () => fetchProducts({}) })

  const trending = [...(products ?? [])]
    .filter((p) => p.price_trend_7d != null)
    .sort((a, b) => Math.abs(b.price_trend_7d!) - Math.abs(a.price_trend_7d!))
    .slice(0, 6)

  const promos = [...(products ?? [])]
    .filter((p) => p.price_trend_7d != null && p.price_trend_7d < -3)
    .sort((a, b) => a.price_trend_7d! - b.price_trend_7d!)
    .slice(0, 3)

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
        <Link to="/recherche" className="flex items-center gap-2.5 rounded-2xl border border-line bg-app-bg px-3.5 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5 flex-shrink-0 text-muted">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="flex-1 text-[15px] text-[#9CA3AF]">Rechercher un produit, un magasin...</span>
        </Link>
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
        {trending.length === 0 && <p className="text-sm text-muted">Pas encore assez de données pour dégager des tendances.</p>}
        <div className="-mx-4.5 flex gap-3 overflow-x-auto px-4.5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trending.map((product) => (
            <Link
              key={product.id}
              to={`/produit/${product.id}`}
              className="min-w-[165px] flex-shrink-0 rounded-card-lg border border-line bg-white p-3.5 shadow-sm"
            >
              <div className="mb-2.5 flex h-11.5 w-11.5 items-center justify-center rounded-xl bg-brand-green-light text-2xl">
                {categoryEmoji(product.category)}
              </div>
              <div className="mb-0.5 text-sm font-bold leading-tight text-ink">{product.name}</div>
              <div className="mb-2.5 text-[11px] text-muted">{product.category}</div>
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-extrabold text-brand-green">
                  {product.median_price != null ? formatFcfa(product.median_price) : '—'}{' '}
                  <small className="text-[11px] font-semibold text-muted">FCFA</small>
                </div>
                {product.price_trend_7d != null && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      product.price_trend_7d <= 0 ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}
                  >
                    {product.price_trend_7d <= 0 ? '▼' : '▲'} {Math.abs(product.price_trend_7d)}%
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {promos.length > 0 && (
        <section className="px-4.5 pt-5.5">
          <h2 className="mb-3.5 flex items-center gap-1.5 text-[17px] font-extrabold text-ink">
            <span>🏷️</span> Promos détectées
          </h2>
          <div className="flex flex-col gap-2.5">
            {promos.map((product) => (
              <Link
                key={product.id}
                to={`/produit/${product.id}`}
                className="flex items-center gap-3.5 rounded-card-lg bg-gradient-to-r from-brand-green to-brand-blue p-4 text-white"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.18] text-[26px]">
                  {categoryEmoji(product.category)}
                </div>
                <div className="flex-1">
                  <div className="mb-0.5 text-[15px] font-extrabold">{product.name}</div>
                  <div className="text-xs leading-snug opacity-90">Baisse de {Math.abs(product.price_trend_7d!)}% cette semaine</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold">
                    {product.median_price != null ? formatFcfa(product.median_price) : '—'}
                    <small className="text-xs font-semibold"> F</small>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-4.5 py-5.5">
        <h2 className="mb-3.5 flex items-center gap-1.5 text-[17px] font-extrabold text-ink">
          <span>🗂️</span> Catégories
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(CATEGORY_EMOJI).map(([label, emoji]) => (
            <Link
              key={label}
              to={`/recherche?categorie=${encodeURIComponent(label)}`}
              className="rounded-2xl border border-line bg-white px-1.5 py-3.5 text-center transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="mb-1.5 block text-[26px]">{emoji}</span>
              <span className="text-[11px] font-semibold text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
