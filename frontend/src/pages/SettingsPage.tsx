import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMyAccount, fetchMyProfile, signOut, updateMyProfile } from '../lib/profile'
import { useSession } from '../hooks/useSession'
import { PROVINCES } from '../lib/locations'

export function SettingsPage() {
  const { session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: fetchMyProfile,
    enabled: !!session,
  })

  const [username, setUsername] = useState('')
  const [preferredProvince, setPreferredProvince] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!profile) return
    setUsername(profile.username)
    setPreferredProvince(profile.preferred_province ?? '')
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await updateMyProfile(session.user.id, {
        username: username.trim(),
        preferred_province: preferredProvince || null,
      })
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      setSaveMessage('Enregistré.')
    } catch {
      setSaveMessage("Impossible d'enregistrer. Réessayez.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/connexion', { replace: true })
  }

  async function handleDeleteAccount() {
    if (!confirm('Supprimer définitivement votre compte et toutes vos contributions ? Cette action est irréversible.')) return
    setIsDeleting(true)
    try {
      await deleteMyAccount()
      navigate('/connexion', { replace: true })
    } catch {
      setSaveMessage('Impossible de supprimer le compte. Réessayez.')
      setIsDeleting(false)
    }
  }

  if (!profile) return null

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
        <div className="flex-1 text-[17px] font-extrabold text-ink">Paramètres</div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5 px-4.5 py-5">
        <div>
          <div className="mb-2 text-[13px] font-bold text-ink">Nom d'utilisateur</div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-2 text-[13px] font-bold text-ink">Province préférée</div>
          <select
            value={preferredProvince}
            onChange={(e) => setPreferredProvince(e.target.value)}
            className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none"
          >
            <option value="">Aucune préférence</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 text-[13px] font-bold text-ink">Téléphone</div>
          <div className="w-full rounded-2xl border-[1.5px] border-line bg-app-bg px-4 py-3.5 text-[15px] text-muted">{profile.phone}</div>
        </div>

        {saveMessage && <p className="text-sm text-muted">{saveMessage}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-2xl bg-brand-green py-4 text-[15px] font-extrabold text-white hover:bg-[#0f5c38] disabled:opacity-60"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      <div className="mx-4.5 mb-5 overflow-hidden rounded-2xl border border-line bg-white">
        <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3.75 text-left">
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

      <div className="mx-4.5 mb-8 rounded-2xl border border-[#FCA5A5] bg-white p-4">
        <div className="mb-1 text-sm font-bold text-[#B91C1C]">Supprimer mon compte</div>
        <p className="mb-3 text-xs leading-relaxed text-muted">
          Supprime définitivement votre compte, votre profil et tous les prix que vous avez publiés. Cette action est
          irréversible.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="w-full rounded-2xl border-[1.5px] border-[#FCA5A5] bg-white py-3 text-sm font-bold text-[#B91C1C] disabled:opacity-60"
        >
          {isDeleting ? 'Suppression...' : 'Supprimer définitivement mon compte'}
        </button>
      </div>
    </div>
  )
}
