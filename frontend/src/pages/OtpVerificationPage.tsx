import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'

const CODE_LENGTH = 6
const RESEND_SECONDS = 30

const FEATURES = [
  {
    title: 'Alimenté par les Gabonais',
    subtitle: "Chaque prix vient d'un utilisateur comme vous.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Comparer pour mieux choisir',
    subtitle: 'Comparez facilement et faites le meilleur choix.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    title: 'Économisez au quotidien',
    subtitle: "Trouvez le meilleur prix avant d'acheter.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
]

export function OtpVerificationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const phone = (location.state as { phone?: string } | null)?.phone

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!phone) {
      navigate('/connexion', { replace: true })
    }
  }, [phone, navigate])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    setCode((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!digits) return
    e.preventDefault()
    setCode((prev) => {
      const next = [...prev]
      for (let i = 0; i < CODE_LENGTH; i++) next[i] = digits[i] ?? ''
      return next
    })
    inputsRef.current[Math.min(digits.length, CODE_LENGTH - 1)]?.focus()
  }

  async function handleResend() {
    if (secondsLeft > 0 || !phone) return
    const { error: resendError } = await supabase.auth.signInWithOtp({ phone })
    if (resendError) {
      setError("Impossible de renvoyer le code pour l'instant. Réessayez plus tard.")
      return
    }
    setError(null)
    setSecondsLeft(RESEND_SECONDS)
    setCode(Array(CODE_LENGTH).fill(''))
    inputsRef.current[0]?.focus()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== CODE_LENGTH) {
      setError('Entrez les 6 chiffres du code.')
      return
    }
    if (!phone) return
    setError(null)
    setIsSubmitting(true)
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: fullCode,
        type: 'sms',
      })
      if (verifyError) {
        setError('Code invalide ou expiré. Réessayez.')
        return
      }
      navigate('/')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!phone) return null

  const timerLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <img src="/hero/auth-hero.png" alt="" className="aspect-[1157/747] w-full object-cover" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 -mt-14 mx-5 rounded-[26px] bg-white px-6 pb-6 pt-7 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
      >
        <Link to="/connexion" className="mb-4.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green-vivid">
          ← Modifier le numéro
        </Link>

        <h1 className="mb-1.5 text-[22px] font-bold text-ink">Vérifiez votre numéro</h1>
        <p className="mb-6.5 text-[15px] leading-relaxed text-muted">
          Entrez le code à 6 chiffres envoyé au <b className="text-ink">{phone}</b>
        </p>

        <div className="mb-6.5 grid grid-cols-6 gap-2.5">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`aspect-square w-full max-w-16 rounded-2xl border-2 text-center text-2xl font-bold transition-colors focus:border-brand-green-vivid focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,163,74,0.12)] focus:outline-none ${
                digit ? 'border-brand-green-vivid bg-white' : 'border-line bg-[#F9FAFB]'
              }`}
            />
          ))}
        </div>

        {error && <p className="mb-4 -mt-3 text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="mb-5 w-full">
          {isSubmitting ? 'Vérification...' : 'Vérifier'}
        </Button>

        <p className="text-center text-sm text-muted">
          Vous n'avez rien reçu ?{' '}
          {secondsLeft > 0 ? (
            <span className="font-bold text-ink">Renvoyer dans {timerLabel}</span>
          ) : (
            <button type="button" onClick={handleResend} className="font-bold text-brand-green-vivid">
              Renvoyer le code
            </button>
          )}
        </p>
      </form>

      <div className="grid flex-1 grid-cols-3 gap-3.5 px-6 py-9">
        {FEATURES.map((feature) => (
          <div key={feature.title}>
            <div className="mb-1.5 text-brand-green-vivid">{feature.icon}</div>
            <div className="mb-0.5 text-sm font-bold leading-tight text-ink">{feature.title}</div>
            <div className="text-xs leading-snug text-muted">{feature.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
