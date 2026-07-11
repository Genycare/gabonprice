import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProduct, fetchProductPrices, type PriceWithContributor } from '../lib/products'
import { fetchMyRatings, fetchMyReportedPriceIds, reportPrice, setPriceRating } from '../lib/ratings'
import { categoryEmoji } from '../lib/categories'
import { formatFcfa } from '../lib/format'
import { timeAgo, formatPurchaseDate } from '../lib/time'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'

const REPORT_REASONS = ['Prix incorrect', 'Information trompeuse ou obsolète', 'Doublon', 'Autre']

function mapsUrl(entry: PriceWithContributor): string {
  if (entry.latitude != null && entry.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${entry.latitude},${entry.longitude}`
  }
  const query = encodeURIComponent(`${entry.store_name}, ${entry.city}, Gabon`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

function PriceCard({
  entry,
  best,
  isOwner,
  myRating,
  reported,
  reportOpen,
  onDelete,
  onVote,
  onToggleReport,
  onReport,
}: {
  entry: PriceWithContributor
  best: boolean
  isOwner: boolean
  myRating: number | undefined
  reported: boolean
  reportOpen: boolean
  onDelete: (id: string) => void
  onVote: (id: string, rating: 1 | -1) => void
  onToggleReport: (id: string) => void
  onReport: (id: string, reason: string) => void
}) {
  return (
    <div className={`rounded-card-lg border bg-white p-4 shadow-sm ${best ? 'border-2 border-brand-green-vivid' : 'border-line'}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10.5 w-10.5 items-center justify-center rounded-[11px] border border-line bg-app-bg text-xl">🏬</div>
          <div>
            <div className="text-[15px] font-bold text-ink">{entry.store_name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-2.75 w-2.75">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {entry.city}
              {entry.neighborhood ? ` · ${entry.neighborhood}` : ''}
            </div>
            {entry.is_median_outlier && (
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-extrabold text-[#B45309]">
                ⚠ Prix inhabituel
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          {best && (
            <div className="mb-1.5 inline-flex items-center gap-0.5 rounded-full bg-brand-green-vivid px-2 py-0.5 text-[10px] font-extrabold text-white">
              ✓ MEILLEUR PRIX
            </div>
          )}
          <div className="text-xl font-extrabold leading-none text-brand-green">
            {formatFcfa(entry.amount)}
            <small className="text-[11px] font-semibold text-muted"> F</small>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2.5 border-y border-line py-3">
        {entry.photo_url ? (
          <img src={entry.photo_url} alt="Ticket de caisse" className="h-11 w-11 flex-shrink-0 rounded-[10px] object-cover" />
        ) : (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] text-xl">
            🧾
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
            {entry.users?.username ?? 'Utilisateur'}{' '}
            <span className="rounded-full bg-[#FEF3C7] px-1.5 py-px text-[10px] font-extrabold text-[#B45309]">
              ★ {entry.users?.karma_score ?? 0}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted">
            Acheté le {formatPurchaseDate(entry.purchase_date)} · publié {timeAgo(entry.created_at)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => onVote(entry.id, 1)}
            disabled={isOwner}
            className={`flex items-center gap-1.5 rounded-[10px] border px-3 py-1.75 text-sm font-bold disabled:opacity-50 ${
              myRating === 1
                ? 'border-brand-green-vivid bg-brand-green-light text-brand-green-vivid'
                : 'border-line bg-app-bg text-muted hover:border-brand-green-vivid hover:text-brand-green-vivid'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.75 w-3.75">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
              <line x1="7" y1="22" x2="7" y2="11" />
            </svg>
            {entry.helpful_votes}
          </button>
          <button
            onClick={() => onVote(entry.id, -1)}
            disabled={isOwner}
            className={`flex items-center gap-1.5 rounded-[10px] border px-3 py-1.75 text-sm font-bold disabled:opacity-50 ${
              myRating === -1
                ? 'border-[#FCA5A5] bg-[#FEE2E2] text-[#B91C1C]'
                : 'border-line bg-app-bg text-muted hover:border-[#FCA5A5] hover:text-[#B91C1C]'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.75 w-3.75">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z" />
              <line x1="17" y1="2" x2="17" y2="13" />
            </svg>
            {entry.unhelpful_votes}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isOwner ? (
            <>
              <Link
                to={`/ajouter?edit=${entry.id}`}
                className="flex items-center gap-1.5 rounded-[10px] border border-line bg-app-bg px-3.5 py-2 text-sm font-bold text-ink"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                className="flex items-center gap-1.5 rounded-[10px] border border-[#FCA5A5] bg-white px-3.5 py-2 text-sm font-bold text-[#B91C1C]"
              >
                Supprimer
              </button>
            </>
          ) : reported ? (
            <span className="text-xs font-semibold text-muted">Signalé ✓</span>
          ) : (
            <button type="button" onClick={() => onToggleReport(entry.id)} className="flex items-center gap-1 text-xs text-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              Signaler
            </button>
          )}
          <a href={mapsUrl(entry)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-[10px] bg-brand-green px-3.5 py-2 text-sm font-bold text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            S'y rendre
          </a>
        </div>
      </div>

      {reportOpen && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => onReport(entry.id, reason)}
              className="rounded-full border border-line bg-app-bg px-2.5 py-1 text-xs font-semibold text-ink hover:border-brand-green-vivid"
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { session } = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [reportOpenId, setReportOpenId] = useState<string | null>(null)

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  })

  const { data: prices, isLoading } = useQuery({
    queryKey: ['product-prices', id],
    queryFn: () => fetchProductPrices(id!),
    enabled: !!id,
  })

  const priceIds = prices?.map((p) => p.id) ?? []

  const { data: myRatings } = useQuery({
    queryKey: ['my-ratings', id, session?.user.id],
    queryFn: () => fetchMyRatings(priceIds, session!.user.id),
    enabled: !!session && priceIds.length > 0,
  })

  const { data: reportedIds } = useQuery({
    queryKey: ['my-reports', id, session?.user.id],
    queryFn: () => fetchMyReportedPriceIds(priceIds, session!.user.id),
    enabled: !!session && priceIds.length > 0,
  })

  function invalidatePrices() {
    queryClient.invalidateQueries({ queryKey: ['product-prices', id] })
    queryClient.invalidateQueries({ queryKey: ['product', id] })
    queryClient.invalidateQueries({ queryKey: ['my-ratings', id, session?.user.id] })
  }

  async function handleDelete(priceId: string) {
    if (!confirm('Supprimer ce prix ?')) return
    const { error } = await supabase.from('prices').delete().eq('id', priceId)
    if (!error) invalidatePrices()
  }

  async function handleVote(priceId: string, rating: 1 | -1) {
    if (!session) return
    await setPriceRating(priceId, session.user.id, rating, myRatings?.[priceId])
    invalidatePrices()
  }

  async function handleReport(priceId: string, reason: string) {
    if (!session) return
    await reportPrice(priceId, session.user.id, reason)
    setReportOpenId(null)
    queryClient.invalidateQueries({ queryKey: ['my-reports', id, session.user.id] })
  }

  const minPrice = prices && prices.length > 0 ? prices[0].amount : null

  if (!id) return null

  return (
    <div>
      <div className="sticky top-0 z-40 flex items-center gap-3.5 border-b border-line bg-white px-4.5 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-app-bg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-ink">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 text-[17px] font-extrabold text-ink">Détail du produit</div>
      </div>

      {product && (
        <div className="border-b border-line bg-white px-4.5 pb-5.5 pt-5">
          <div className="mb-4.5 flex items-start gap-4">
            <div className="flex h-20.5 w-20.5 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-green-light text-[42px]">
              {categoryEmoji(product.category)}
            </div>
            <div className="flex-1">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-green-vivid">{product.category}</div>
              <div className="mb-1.5 text-xl font-extrabold leading-tight text-ink">{product.name}</div>
              <div className="text-xs text-muted">
                {prices?.length ?? 0} prix relevés · {new Set(prices?.map((p) => p.store_name)).size ?? 0} magasins
              </div>
            </div>
          </div>
          <div className="flex gap-2.5">
            <div className="flex-1 rounded-2xl border border-line bg-app-bg p-3 text-center">
              <div className="mb-1 text-[11px] font-semibold text-muted">Prix médian</div>
              <div className="text-[17px] font-extrabold text-ink">
                {product.median_price != null ? formatFcfa(product.median_price) : '—'}
                <small className="text-[11px]"> F</small>
              </div>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-app-bg p-3 text-center">
              <div className="mb-1 text-[11px] font-semibold text-muted">Le moins cher</div>
              <div className="text-[17px] font-extrabold text-brand-green">
                {minPrice != null ? formatFcfa(minPrice) : '—'}
                <small className="text-[11px]"> F</small>
              </div>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-app-bg p-3 text-center">
              <div className="mb-1 text-[11px] font-semibold text-muted">Tendance 7j</div>
              <div className="text-[17px] font-extrabold text-ink">
                {product.price_trend_7d == null ? '—' : product.price_trend_7d <= 0 ? '▼' : '▲'}
              </div>
              {product.price_trend_7d != null && (
                <div className={`mt-0.5 text-xs font-bold ${product.price_trend_7d <= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                  {product.price_trend_7d > 0 ? '+' : ''}
                  {product.price_trend_7d}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4.5 pb-3 pt-5">
        <div className="text-base font-extrabold text-ink">Tous les prix</div>
      </div>

      <div className="flex flex-col gap-3 px-4.5 pb-6">
        {isLoading && <p className="text-center text-sm text-muted">Chargement...</p>}
        {prices?.length === 0 && <p className="text-center text-sm text-muted">Aucun prix relevé pour ce produit.</p>}
        {prices?.map((entry, i) => (
          <PriceCard
            key={entry.id}
            entry={entry}
            best={i === 0}
            isOwner={entry.user_id === session?.user.id}
            myRating={myRatings?.[entry.id]}
            reported={reportedIds?.includes(entry.id) ?? false}
            reportOpen={reportOpenId === entry.id}
            onDelete={handleDelete}
            onVote={handleVote}
            onToggleReport={(priceId) => setReportOpenId((current) => (current === priceId ? null : priceId))}
            onReport={handleReport}
          />
        ))}
      </div>
    </div>
  )
}
