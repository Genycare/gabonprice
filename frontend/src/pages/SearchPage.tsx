import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts, fetchProductPrices, fetchPriceHistory, type Product, type PriceWithContributor } from '../lib/products'
import { CATEGORY_EMOJI, categoryEmoji } from '../lib/categories'
import { formatFcfa } from '../lib/format'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { cacheProducts, searchOfflineProducts } from '../lib/offlineProducts'
import { useSelectedCity } from '../hooks/useSelectedCity'
import { CityPicker } from '../components/CityPicker'

const AVATAR_COLORS = [
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#DCFCE7', text: '#15803D' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#E0E7FF', text: '#4338CA' },
  { bg: '#FFEDD5', text: '#C2410C' },
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function freshnessLabel(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diffDays <= 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function trustBadge(entry: PriceWithContributor, isBest: boolean) {
  if (isBest) return { label: 'Meilleur prix', className: 'bg-brand-green-vivid text-white' }
  const level = entry.users?.level
  if (level === 'Confirmé' || level === 'Expert') {
    return { label: 'Fiable', className: 'bg-[#DCFCE7] text-[#15803D]' }
  }
  return { label: 'Moyen', className: 'bg-[#FEF3C7] text-[#B45309]' }
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const w = 100
  const h = 32
  const step = w / (points.length - 1)
  const coords = points.map((p, i) => `${i * step},${h - ((p - min) / range) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full text-brand-green-vivid">
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProductResultGroup({ product, showHeader }: { product: Product; showHeader: boolean }) {
  const { data: prices, isLoading } = useQuery({
    queryKey: ['product-prices', product.id],
    queryFn: () => fetchProductPrices(product.id),
  })

  const { data: history } = useQuery({
    queryKey: ['price-history', product.id],
    queryFn: () => fetchPriceHistory(product.id, 7),
  })

  const best = prices?.[0]

  return (
    <div className="mb-6">
      {showHeader && (
        <div className="mb-3 flex items-center gap-2.5 px-4.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green-light text-lg">
            {categoryEmoji(product.category)}
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-ink">{product.name}</div>
            <div className="text-[11px] text-muted">{product.category}</div>
          </div>
        </div>
      )}

      {isLoading && <p className="px-4.5 text-sm text-muted">Chargement...</p>}
      {prices?.length === 0 && <p className="px-4.5 text-sm text-muted">Aucun prix relevé pour ce produit.</p>}

      {best && (
        <div className="mx-4.5 mb-3.5 flex items-center justify-between gap-3 rounded-card-lg border border-[#FDE68A] bg-[#FFFBEB] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              {categoryEmoji(product.category)}
            </div>
            <div>
              <div className="mb-0.5 text-xs font-semibold text-muted">Meilleur prix aujourd'hui</div>
              <div className="text-xl font-extrabold leading-none text-brand-green">
                {formatFcfa(best.amount)} <small className="text-xs font-semibold text-muted">FCFA</small>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                chez {best.store_name}
                <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-green-light px-1.5 py-0.5 text-[10px] font-bold text-brand-green">
                  ✓ Fiable
                </span>
              </div>
            </div>
          </div>
          {history && history.length >= 2 && (
            <div className="w-24 flex-shrink-0 text-right">
              <div className="mb-1 text-[10px] font-semibold text-muted">Évolution 7j</div>
              <Sparkline points={history.map((h) => h.median_price)} />
              {product.price_trend_7d != null && (
                <span
                  className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    product.price_trend_7d <= 0 ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                  }`}
                >
                  {product.price_trend_7d <= 0 ? '▼' : '▲'} {Math.abs(product.price_trend_7d)}%
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {prices && prices.length > 0 && (
        <div className="mb-2.5 px-4.5 text-[13px] font-semibold text-muted">
          {prices.length} résultat{prices.length !== 1 ? 's' : ''} trouvé{prices.length !== 1 ? 's' : ''}
        </div>
      )}

      <div className="flex flex-col gap-2.5 px-4.5">
        {prices?.map((entry, i) => {
          const badge = trustBadge(entry, i === 0)
          const colors = avatarColor(entry.store_name)
          return (
            <Link
              key={entry.id}
              to={`/produit/${product.id}`}
              className="flex items-center gap-3 rounded-card border border-line bg-white p-3 shadow-sm"
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-extrabold"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {entry.store_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-ink">{entry.store_name}</div>
                <div className="mt-0.5 text-xs text-muted">{freshnessLabel(entry.created_at)}</div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-brand-green">
                  {formatFcfa(entry.amount)}
                  <small className="text-[11px] font-semibold text-muted"> FCFA</small>
                </div>
                <span className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0 text-muted">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function SearchPage() {
  const isOnline = useOnlineStatus()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('categorie') ?? ''
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [city, setCity] = useSelectedCity()
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: onlineProducts, isLoading, isError } = useQuery({
    queryKey: ['products', { search, category }],
    queryFn: () => fetchProducts({ search: search || undefined, category: category || undefined }),
    enabled: isOnline,
  })

  useEffect(() => {
    if (isOnline && onlineProducts && !search && !category) {
      cacheProducts(onlineProducts)
    }
  }, [isOnline, onlineProducts, search, category])

  const products: Product[] | undefined = isOnline ? onlineProducts : searchOfflineProducts(search)
  const categories = Object.keys(CATEGORY_EMOJI)

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-line bg-white px-4.5 pb-3.5 pt-4">
        <h1 className="sr-only">Recherche</h1>
        <div className="mx-auto max-w-2xl">
        <div className="mb-3 flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-line"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-ink">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-2xl border-[1.5px] border-line bg-app-bg px-3.5 py-2.5 focus-within:border-brand-green-vivid focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.1)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4.5 w-4.5 flex-shrink-0 text-muted">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              autoFocus
              aria-label="Rechercher un produit"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un produit..."
              className="flex-1 border-none bg-transparent text-[15px] text-ink placeholder:text-[#9CA3AF] focus:outline-none"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                aria-label="Effacer la recherche"
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-line text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="h-2.75 w-2.75">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setSearch(searchInput.trim())}
            aria-label="Lancer la recherche"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green-vivid text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-5 w-5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {isOnline ? (
          <div className="flex items-center gap-2">
            <div className="-mx-4.5 flex flex-1 gap-2 overflow-x-auto px-4.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() =>
                  setSearchParams((params) => {
                    params.delete('categorie')
                    return params
                  })
                }
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-bold ${
                  !category ? 'bg-brand-green-vivid text-white' : 'border border-line bg-white text-ink'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSearchParams((params) => {
                      params.set('categorie', cat)
                      return params
                    })
                  }
                  className={`flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-bold ${
                    category === cat ? 'bg-brand-green-vivid text-white' : 'border border-line bg-white text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPickerOpen(true)}
              className="flex flex-shrink-0 items-center gap-1.25 rounded-full bg-brand-green-light px-3 py-2 text-xs font-bold text-brand-green"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {city}
            </button>
          </div>
        ) : (
          <p className="text-center text-xs font-semibold text-muted">
            Hors ligne — recherche sur les produits déjà consultés, filtres indisponibles
          </p>
        )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl pt-4">
        {isOnline && isLoading && <p className="px-4.5 text-center text-sm text-muted">Chargement...</p>}
        {isOnline && isError && <p className="px-4.5 text-center text-sm text-red-600">Erreur lors du chargement des produits.</p>}
        {products?.length === 0 && <p className="px-4.5 text-center text-sm text-muted">Aucun produit trouvé.</p>}

        {products?.map((product) => (
          <ProductResultGroup key={product.id} product={product} showHeader={(products?.length ?? 0) > 1} />
        ))}
      </div>

      {pickerOpen && <CityPicker selectedCity={city} onSelect={setCity} onClose={() => setPickerOpen(false)} />}
    </div>
  )
}
