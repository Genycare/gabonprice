import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchUserPrices, type UserPrice } from '../lib/products'
import { categoryEmoji } from '../lib/categories'
import { formatFcfa } from '../lib/format'
import { timeAgo } from '../lib/time'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'

type Tab = 'all' | 'active' | 'flagged'

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  active: { label: '● Actif', className: 'bg-[#DCFCE7] text-[#15803D]' },
  flagged: { label: '⚠ Signalé', className: 'bg-[#FEF3C7] text-[#B45309]' },
  removed: { label: '✕ Retiré', className: 'bg-[#FEE2E2] text-[#B91C1C]' },
}

function ContributionCard({ entry, onDelete }: { entry: UserPrice; onDelete: (id: string) => void }) {
  const status = STATUS_LABEL[entry.status] ?? STATUS_LABEL.active
  const removed = entry.status === 'removed'

  return (
    <div className="rounded-card border border-line bg-white p-3.5 shadow-sm">
      <div className="mb-2.5 flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[11px] bg-brand-green-light text-xl">
          {categoryEmoji(entry.products?.category ?? '')}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-ink">{entry.products?.name ?? 'Produit supprimé'}</div>
          <div className="mt-0.5 text-xs text-muted">
            {entry.store_name} · {entry.city}
            {entry.neighborhood ? `, ${entry.neighborhood}` : ''} · publié {timeAgo(entry.created_at)}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-base font-extrabold ${removed ? 'text-muted line-through' : 'text-brand-green'}`}>
            {formatFcfa(entry.amount)}
            <small className="text-[11px] font-semibold"> F</small>
          </div>
          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>

      {!removed && (
        <div className="flex gap-2 border-t border-line pt-2.5">
          <Link
            to={`/ajouter?edit=${entry.id}`}
            className="flex-1 rounded-[10px] border border-line bg-app-bg py-2 text-center text-[13px] font-bold text-ink"
          >
            Modifier
          </Link>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex-1 rounded-[10px] border border-line bg-app-bg py-2 text-[13px] font-bold text-[#B91C1C]"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}

export function HistoryPage() {
  const { session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('all')

  const { data: prices, isLoading } = useQuery({
    queryKey: ['user-prices', session?.user.id],
    queryFn: () => fetchUserPrices(session!.user.id),
    enabled: !!session,
  })

  async function handleDelete(priceId: string) {
    if (!confirm('Supprimer ce prix ?')) return
    const { error } = await supabase.from('prices').delete().eq('id', priceId)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['user-prices', session?.user.id] })
    }
  }

  const filtered = prices?.filter((p) => (tab === 'all' ? true : p.status === tab))

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
        <div className="flex-1 text-[17px] font-extrabold text-ink">Mes contributions</div>
      </div>

      <div className="flex gap-2 px-4.5 pt-3.5">
        {(
          [
            ['all', `Toutes (${prices?.length ?? 0})`],
            ['active', 'Actives'],
            ['flagged', 'Signalées'],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-bold ${
              tab === value ? 'border-brand-green-light bg-brand-green-light text-brand-green' : 'border-line bg-white text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4.5 py-4">
        {isLoading && <p className="text-center text-sm text-muted">Chargement...</p>}
        {filtered?.length === 0 && <p className="text-center text-sm text-muted">Aucune contribution ici.</p>}
        {filtered?.map((entry) => (
          <ContributionCard key={entry.id} entry={entry} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
