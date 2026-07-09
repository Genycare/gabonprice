import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { categoryEmoji } from '../lib/categories'
import { formatFcfa } from '../lib/format'

interface ConfirmationState {
  productId: string
  productName: string
  productCategory: string
  amount: number
  storeName: string
  city: string
  neighborhood?: string | null
}

export function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as ConfirmationState | null) ?? null

  useEffect(() => {
    if (!state) navigate('/', { replace: true })
  }, [state, navigate])

  if (!state) return null

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-7 py-10 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-green-light">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-brand-green-vivid">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="mb-2 text-[22px] font-extrabold text-ink">Prix publié !</h1>
      <p className="mb-6 max-w-[280px] text-sm leading-relaxed text-muted">
        Merci pour votre contribution. Elle est déjà visible par toute la communauté GabonPrice.
      </p>

      <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-gold to-[#F59E0B] px-4.5 py-2.5 text-sm font-extrabold text-[#78350F] shadow-[0_6px_18px_rgba(245,158,11,0.3)]">
        ★ +10 karma
      </div>

      <div className="mb-8 flex w-full items-center gap-3 rounded-2xl border border-line bg-app-bg p-3.5 text-left">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[11px] border border-line bg-white text-xl">
          {categoryEmoji(state.productCategory)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-ink">{state.productName}</div>
          <div className="mt-0.5 text-xs text-muted">
            {state.storeName} · {state.city}
            {state.neighborhood ? `, ${state.neighborhood}` : ''}
          </div>
        </div>
        <div className="text-base font-extrabold text-brand-green">
          {formatFcfa(state.amount)}
          <small className="text-[11px] font-semibold text-muted"> F</small>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <button
          onClick={() => navigate(`/produit/${state.productId}`)}
          className="w-full rounded-2xl bg-brand-green py-4 text-base font-extrabold text-white hover:bg-[#0f5c38]"
        >
          Voir le produit
        </button>
        <button
          onClick={() => navigate('/ajouter')}
          className="w-full rounded-2xl border-[1.5px] border-line bg-white py-4 text-[15px] font-extrabold text-ink"
        >
          Ajouter un autre prix
        </button>
      </div>
    </div>
  )
}
