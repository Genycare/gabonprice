import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gp_install_dismissed'

// Type minimal pour l'événement Android (non standard dans les libs TS)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|chrome|android/.test(ua)
  return isIOS && isSafari
}

export function InstallPrompt() {
  const [mode, setMode] = useState<'none' | 'android' | 'ios'>('none')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandalone()) return
    if (window.localStorage.getItem(STORAGE_KEY) === '1') return

    // ANDROID : on capture l'invite native pour la déclencher via notre bouton
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // iOS : pas d'événement natif → on détecte et on affiche le guide après un délai
    let t: ReturnType<typeof setTimeout> | undefined
    if (isIosSafari()) {
      t = setTimeout(() => setMode((m) => (m === 'none' ? 'ios' : m)), 1500)
    }

    function onInstalled() {
      dismiss()
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      if (t) clearTimeout(t)
    }
  }, [])

  function dismiss() {
    setMode('none')
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // localStorage indisponible (mode privé strict)
    }
  }

  async function installAndroid() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (mode === 'none') return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Installer GabonPrice"
      onClick={dismiss}
      className="fixed inset-0 z-9999 flex items-end justify-center bg-ink/55"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-110 animate-gp-slide-up rounded-t-3xl bg-white px-5.5 pb-8 pt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
      >
        <button
          aria-label="Fermer"
          onClick={dismiss}
          className="absolute right-4 top-4 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-app-bg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-4 w-4 text-muted">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
          style={{
            background: 'conic-gradient(from 45deg, #FCD34D 0deg 90deg, #16A34A 90deg 180deg, #1E3A8A 180deg 270deg, #3B82F6 270deg 360deg)',
          }}
        >
          <span className="text-[32px]">🏷️</span>
        </div>

        <h2 className="mb-1.5 text-center text-[19px] font-extrabold text-ink">Installez GabonPrice</h2>
        <p className="mb-5.5 text-center text-sm leading-relaxed text-muted">
          Ajoutez l'app à votre écran d'accueil pour un accès rapide, même hors connexion.
        </p>

        {mode === 'android' ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={installAndroid}
              className="w-full rounded-2xl bg-brand-green py-3.75 text-base font-extrabold text-white transition-colors hover:bg-[#0f5c38]"
            >
              Installer l'application
            </button>
            <button onClick={dismiss} className="w-full py-2 text-sm font-semibold text-muted">
              Plus tard
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            <Step num={1}>
              Touchez le bouton <ShareIcon /> <b className="font-bold">Partager</b> en bas de Safari
            </Step>
            <Step num={2}>
              Faites défiler et choisissez <Pill>Sur l'écran d'accueil</Pill>
            </Step>
            <Step num={3}>
              Touchez <b className="font-bold">Ajouter</b> — c'est prêt&nbsp;! 🎉
            </Step>
          </div>
        )}
      </div>
    </div>
  )
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-full bg-brand-green-light text-sm font-extrabold text-brand-green">
        {num}
      </div>
      <div className="text-sm leading-snug text-ink">{children}</div>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-[7px] border border-line bg-app-bg px-1.75 py-px text-[12.5px] font-bold text-ink">{children}</span>
  )
}

function ShareIcon() {
  return (
    <span className="inline-flex h-5.5 w-5.5 items-center justify-center align-middle">
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="#007AFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </span>
  )
}
