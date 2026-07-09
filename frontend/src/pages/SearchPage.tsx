import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts, type Product } from '../lib/products'
import { categoryEmoji } from '../lib/categories'
import { formatFcfa } from '../lib/format'
import { PROVINCES, CITIES_BY_PROVINCE } from '../lib/locations'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { cacheProducts, searchOfflineProducts } from '../lib/offlineProducts'

export function SearchPage() {
  const isOnline = useOnlineStatus()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: onlineProducts, isLoading, isError } = useQuery({
    queryKey: ['products', { search, province, city }],
    queryFn: () => fetchProducts({ search: search || undefined, province: province || undefined, city: city || undefined }),
    enabled: isOnline,
  })

  useEffect(() => {
    if (isOnline && onlineProducts && !search && !province && !city) {
      cacheProducts(onlineProducts)
    }
  }, [isOnline, onlineProducts, search, province, city])

  const products: Product[] | undefined = isOnline ? onlineProducts : searchOfflineProducts(search)

  const cityOptions = province ? CITIES_BY_PROVINCE[province as keyof typeof CITIES_BY_PROVINCE] : []

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-line bg-white px-4.5 pb-3.5 pt-4">
        <div className="mb-3 flex items-center gap-2.5 rounded-2xl border-[1.5px] border-line bg-app-bg px-3.5 py-3 focus-within:border-brand-green-vivid focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.1)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5 flex-shrink-0 text-muted">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 border-none bg-transparent text-[15px] text-ink placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </div>
        {isOnline ? (
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value)
                setCity('')
              }}
              className={`rounded-xl border-[1.5px] px-3 py-2.5 text-[13px] font-semibold focus:outline-none ${
                province ? 'border-brand-green-light bg-brand-green-light text-brand-green' : 'border-line bg-white text-ink'
              }`}
            >
              <option value="">Toutes provinces</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!province}
              className={`rounded-xl border-[1.5px] px-3 py-2.5 text-[13px] font-semibold focus:outline-none disabled:opacity-50 ${
                city ? 'border-brand-green-light bg-brand-green-light text-brand-green' : 'border-line bg-white text-ink'
              }`}
            >
              <option value="">Toutes villes</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-center text-xs font-semibold text-muted">
            Hors ligne — recherche sur les produits déjà consultés, filtres province/ville indisponibles
          </p>
        )}
      </header>

      <div className="flex items-center justify-between px-4.5 pb-2.5 pt-4">
        <div className="text-[13px] font-semibold text-muted">
          {products ? `${products.length} produit${products.length !== 1 ? 's' : ''} trouvé${products.length !== 1 ? 's' : ''}` : ' '}
        </div>
        <button className="flex items-center gap-1.25 rounded-full bg-brand-green-light px-3 py-1.5 text-xs font-bold text-brand-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-3.25 w-3.25">
            <line x1="12" y1="20" x2="12" y2="10" />
            <polyline points="6 14 12 20 18 14" />
          </svg>
          Moins cher
        </button>
      </div>

      <div className="flex flex-col gap-2.5 px-4.5 pb-5">
        {isOnline && isLoading && <p className="text-center text-sm text-muted">Chargement...</p>}
        {isOnline && isError && <p className="text-center text-sm text-red-600">Erreur lors du chargement des produits.</p>}
        {products?.length === 0 && <p className="text-center text-sm text-muted">Aucun produit trouvé.</p>}

        {products?.map((product) => (
          <Link
            key={product.id}
            to={`/produit/${product.id}`}
            className="flex items-center gap-3 rounded-card border border-line bg-white p-3 shadow-sm"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green-light text-2xl">
              {categoryEmoji(product.category)}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-ink">{product.name}</div>
              <div className="text-xs text-muted">{product.category}</div>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold text-brand-green">
                {product.median_price != null ? formatFcfa(product.median_price) : '—'}
                <small className="text-[11px] font-semibold text-muted"> F</small>
              </div>
              {product.price_trend_7d != null && (
                <span
                  className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
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
    </div>
  )
}
