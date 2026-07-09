import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { fetchMyProfile, signOut } from '../lib/profile'
import { fetchUserPrices } from '../lib/products'
import { useSession } from '../hooks/useSession'
import { levelProgress } from '../lib/karma'

function formatPhone(phone: string): string {
  const match = phone.match(/^\+241(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (!match) return phone
  return `+241 ${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`
}

function initials(username: string): string {
  const clean = username.replace(/^user_/, '')
  return clean.slice(0, 2).toUpperCase()
}

export function ProfilePage() {
  const { session } = useSession()
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: fetchMyProfile,
    enabled: !!session,
  })

  const { data: prices } = useQuery({
    queryKey: ['user-prices', session?.user.id],
    queryFn: () => fetchUserPrices(session!.user.id),
    enabled: !!session,
  })

  async function handleSignOut() {
    await signOut()
    navigate('/connexion', { replace: true })
  }

  if (!profile) return null

  const progress = levelProgress(profile.karma_score)
  const provinceCount = new Set(prices?.map((p) => p.province)).size

  return (
    <div>
      <div className="bg-gradient-to-br from-brand-green to-brand-blue px-4.5 pb-14 pt-7 text-center text-white">
        <div className="mx-auto mb-3 flex h-19 w-19 items-center justify-center rounded-full border-[3px] border-white/40 bg-white/20 text-[28px] font-extrabold">
          {initials(profile.username)}
        </div>
        <div className="mb-1 text-[19px] font-extrabold">{profile.username}</div>
        <div className="mb-2.5 text-[13px] text-white/85">{formatPhone(profile.phone)}</div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.25 text-xs font-bold">
          ⭐ {profile.level}
        </div>
      </div>

      <div className="relative z-10 -mt-10.5 mx-4.5 flex rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
        <div className="flex-1 text-center">
          <div className="text-[19px] font-extrabold text-brand-green-vivid">{profile.karma_score}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-muted">Karma</div>
        </div>
        <div className="flex-1 border-l border-line text-center">
          <div className="text-[19px] font-extrabold text-ink">{prices?.length ?? 0}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-muted">Prix publiés</div>
        </div>
        <div className="flex-1 border-l border-line text-center">
          <div className="text-[19px] font-extrabold text-ink">{provinceCount}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-muted">Provinces</div>
        </div>
      </div>

      <div className="mx-4.5 mt-5 rounded-2xl border border-line bg-white p-4">
        {progress.next ? (
          <>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="text-[13px] font-bold text-ink">Progression vers {progress.next}</div>
              <div className="text-[11px] text-muted">
                {progress.karma} / {progress.nextMin}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-app-bg">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-green-vivid to-brand-gold"
                style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
              />
            </div>
          </>
        ) : (
          <div className="text-[13px] font-bold text-ink">🏆 Niveau maximum atteint</div>
        )}
      </div>

      <div className="mx-4.5 mt-5 overflow-hidden rounded-2xl border border-line bg-white">
        <Link to="/historique" className="flex items-center gap-3 border-b border-line px-4 py-3.75">
          <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-green-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.25 w-4.25 text-brand-green-vivid">
              <rect x="9" y="3" width="12" height="18" rx="2" />
              <path d="M5 8H3m2 4H3m2 4H3" />
            </svg>
          </div>
          <div className="flex-1 text-sm font-semibold text-ink">Mes contributions</div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        <div className="flex items-center gap-3 border-b border-line px-4 py-3.75">
          <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-green-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.25 w-4.25 text-brand-green-vivid">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="flex-1 text-sm font-semibold text-ink">Province préférée</div>
          <div className="text-sm text-muted">{profile.preferred_province ?? '—'}</div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3.75 text-left"
        >
          <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#FEE2E2]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.25 w-4.25 text-[#B91C1C]">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <div className="flex-1 text-sm font-semibold text-[#B91C1C]">Déconnexion</div>
        </button>
      </div>

      <div className="py-5 text-center text-[11px] text-muted">GabonPrice v1.0.0</div>
    </div>
  )
}
