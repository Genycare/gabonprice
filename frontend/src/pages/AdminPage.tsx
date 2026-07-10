import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminStats,
  fetchModerationQueue,
  fetchPendingReports,
  restorePrice,
  deletePriceForever,
  banUser,
  resolveReport,
  type ModerationPrice,
  type PendingReport,
} from '../lib/admin'
import { categoryEmoji } from '../lib/categories'
import { formatFcfa } from '../lib/format'
import { timeAgo } from '../lib/time'

type Tab = 'flagged' | 'removed' | 'reports'

function ActionButton({ tone, onClick, children }: { tone: 'restore' | 'delete' | 'ban'; onClick: () => void; children: React.ReactNode }) {
  const toneClass = {
    restore: 'border-[#A7F3D0] bg-brand-green-light text-brand-green',
    delete: 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]',
    ban: 'border-ink bg-ink text-white',
  }[tone]
  return (
    <button onClick={onClick} className={`flex-1 rounded-[11px] border py-2.5 text-[13px] font-bold ${toneClass}`}>
      {children}
    </button>
  )
}

function ModerationCard({ price, onChanged }: { price: ModerationPrice; onChanged: () => void }) {
  const flagged = price.status === 'flagged'

  async function handleRestore() {
    await restorePrice(price.id)
    onChanged()
  }
  async function handleDelete() {
    if (!confirm('Supprimer définitivement ce prix ?')) return
    await deletePriceForever(price.id)
    onChanged()
  }
  async function handleBan() {
    if (!confirm(`Bannir ${price.users?.username ?? "cet utilisateur"} ?`)) return
    await banUser(price.user_id)
    onChanged()
  }

  return (
    <div className={`rounded-card border border-line bg-white p-4 shadow-sm ${flagged ? 'border-l-4 border-l-[#B45309]' : 'border-l-4 border-l-[#DC2626]'}`}>
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.75">
          <div className="flex h-10.5 w-10.5 flex-shrink-0 items-center justify-center rounded-[11px] border border-line bg-app-bg text-xl">
            {categoryEmoji(price.products?.category ?? '')}
          </div>
          <div>
            <div className="text-[15px] font-bold text-ink">{price.products?.name ?? 'Produit supprimé'}</div>
            <div className="mt-0.5 text-xs text-muted">
              {price.store_name} · {price.city}, {price.province}
            </div>
          </div>
        </div>
        <div className="whitespace-nowrap text-right text-[19px] font-extrabold text-ink">
          {formatFcfa(price.amount)}
          <small className="text-[11px] font-semibold text-muted"> F</small>
        </div>
      </div>

      <div
        className={`mb-2.5 inline-flex items-center gap-1 rounded-full px-2.25 py-1 text-[10px] font-extrabold ${
          flagged ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FEE2E2] text-[#DC2626]'
        }`}
      >
        {flagged ? '⚠ SIGNALÉ' : '✕ RETIRÉ'} · {price.unhelpful_votes} votes négatifs
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs text-muted">
        Par <b className="text-ink">{price.users?.username ?? 'Inconnu'}</b>
        <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-extrabold text-[#B45309]">★ {price.users?.karma_score ?? 0}</span>
        · publié {timeAgo(price.created_at)} ·
        <span className="font-bold text-brand-green-vivid">👍 {price.helpful_votes}</span>
        <span className="font-bold text-[#DC2626]">👎 {price.unhelpful_votes}</span>
      </div>

      <div className="flex gap-2">
        <ActionButton tone="restore" onClick={handleRestore}>
          Rétablir
        </ActionButton>
        <ActionButton tone="delete" onClick={handleDelete}>
          Supprimer
        </ActionButton>
        <ActionButton tone="ban" onClick={handleBan}>
          Bannir
        </ActionButton>
      </div>
    </div>
  )
}

function ReportCard({ report, onChanged }: { report: PendingReport; onChanged: () => void }) {
  const price = report.prices

  async function handleResolve() {
    await resolveReport(report.id)
    onChanged()
  }
  async function handleDelete() {
    if (!price) return
    if (!confirm('Supprimer définitivement ce prix ?')) return
    await deletePriceForever(price.id)
    await resolveReport(report.id)
    onChanged()
  }

  return (
    <div className="rounded-card border border-l-4 border-line border-l-[#1D4ED8] bg-white p-4 shadow-sm">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.75">
          <div className="flex h-10.5 w-10.5 flex-shrink-0 items-center justify-center rounded-[11px] border border-line bg-app-bg text-xl">
            {categoryEmoji(price?.products?.category ?? '')}
          </div>
          <div>
            <div className="text-[15px] font-bold text-ink">{price?.products?.name ?? 'Produit supprimé'}</div>
            {price && (
              <div className="mt-0.5 text-xs text-muted">
                {price.store_name} · {price.city}, {price.province}
              </div>
            )}
          </div>
        </div>
        {price && (
          <div className="whitespace-nowrap text-right text-[19px] font-extrabold text-ink">
            {formatFcfa(price.amount)}
            <small className="text-[11px] font-semibold text-muted"> F</small>
          </div>
        )}
      </div>

      <div className="mb-2.5 inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.25 py-1 text-[10px] font-extrabold text-[#1D4ED8]">
        SIGNALEMENT
      </div>

      <div className="mb-3 rounded-[10px] bg-app-bg px-3 py-2.5 text-[13px] leading-snug text-ink">{report.reason}</div>

      <div className="mb-3 text-xs text-muted">
        Par <b className="text-ink">{report.users?.username ?? 'Inconnu'}</b> · signalé {timeAgo(report.created_at)}
      </div>

      <div className="flex gap-2">
        <ActionButton tone="restore" onClick={handleResolve}>
          Marquer traité
        </ActionButton>
        {price && (
          <ActionButton tone="delete" onClick={handleDelete}>
            Supprimer le prix
          </ActionButton>
        )}
      </div>
    </div>
  )
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('flagged')
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats })
  const { data: flagged } = useQuery({ queryKey: ['admin-queue', 'flagged'], queryFn: () => fetchModerationQueue('flagged') })
  const { data: removed } = useQuery({ queryKey: ['admin-queue', 'removed'], queryFn: () => fetchModerationQueue('removed') })
  const { data: reports } = useQuery({ queryKey: ['admin-reports'], queryFn: fetchPendingReports })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
    queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
  }

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'flagged', label: 'Signalés', count: flagged?.length ?? 0 },
    { value: 'removed', label: 'Retirés', count: removed?.length ?? 0 },
    { value: 'reports', label: 'Rapports', count: reports?.length ?? 0 },
  ]

  return (
    <div className="min-h-svh bg-app-bg">
      <div className="bg-gradient-to-br from-brand-green to-brand-blue px-4.5 pb-5 pt-5.5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[17px] font-extrabold">Administration</div>
            <div className="text-[11px] font-semibold opacity-85">GabonPrice</div>
          </div>
          <div className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wide">ADMIN</div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[14px] border border-white/18 bg-white/13 p-3">
            <div className="text-[22px] font-extrabold leading-none">{stats?.total_prices ?? '—'}</div>
            <div className="mt-1.25 text-[11px] font-semibold opacity-90">Prix publiés</div>
            <div className="mt-0.75 text-[11px] font-bold text-[#86EFAC]">▲ {stats?.prices_last_7d ?? 0} cette semaine</div>
          </div>
          <div className="rounded-[14px] border border-white/18 bg-white/13 p-3">
            <div className="text-[22px] font-extrabold leading-none">{stats?.active_contributors ?? '—'}</div>
            <div className="mt-1.25 text-[11px] font-semibold opacity-90">Contributeurs actifs</div>
            <div className="mt-0.75 text-[11px] font-bold text-[#86EFAC]">▲ {stats?.contributors_last_30d ?? 0} ce mois</div>
          </div>
          <div className="rounded-[14px] border border-white/18 bg-white/13 p-3">
            <div className="text-[22px] font-extrabold leading-none">{stats ? `${stats.median_freshness_days.toFixed(1)} j` : '—'}</div>
            <div className="mt-1.25 text-[11px] font-semibold opacity-90">Fraîcheur médiane</div>
          </div>
          <div className="rounded-[14px] border border-white/18 bg-white/13 p-3">
            <div className="text-[22px] font-extrabold leading-none">{stats ? `${stats.removed_rate_pct}%` : '—'}</div>
            <div className="mt-1.25 text-[11px] font-semibold opacity-90">Taux de prix retirés</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4.5 pb-1 pt-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 rounded-xl border py-2.5 text-[13px] font-bold ${
              tab === t.value ? 'border-brand-green bg-brand-green text-white' : 'border-line bg-white text-muted'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-1.25 inline-flex min-w-4.5 items-center justify-center rounded-full px-1.25 py-0.25 text-[10px] font-extrabold ${
                  tab === t.value ? 'bg-white/30 text-white' : 'bg-[#DC2626] text-white'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4.5 pb-2 pt-3 text-xs font-bold uppercase tracking-wide text-muted">
        File de modération · {tabs.find((t) => t.value === tab)?.label}
      </div>

      <div className="flex flex-col gap-3 px-4.5 pb-6">
        {tab === 'flagged' &&
          (flagged?.length ? flagged.map((p) => <ModerationCard key={p.id} price={p} onChanged={refresh} />) : (
            <p className="py-6 text-center text-sm text-muted">Aucun prix signalé.</p>
          ))}
        {tab === 'removed' &&
          (removed?.length ? removed.map((p) => <ModerationCard key={p.id} price={p} onChanged={refresh} />) : (
            <p className="py-6 text-center text-sm text-muted">Aucun prix retiré.</p>
          ))}
        {tab === 'reports' &&
          (reports?.length ? reports.map((r) => <ReportCard key={r.id} report={r} onChanged={refresh} />) : (
            <p className="py-6 text-center text-sm text-muted">Aucun signalement en attente.</p>
          ))}
      </div>
    </div>
  )
}
