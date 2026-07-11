import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
)

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Entrez une adresse email valide.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email })
      if (otpError) {
        setError(
          otpError.message.includes('rate limit')
            ? 'Trop de tentatives. Réessayez dans quelques minutes.'
            : "Impossible d'envoyer le code. Vérifiez l'adresse et réessayez.",
        )
        return
      }
      navigate('/verification', { state: { email } })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-svh bg-white">
      <div className="relative w-full" style={{ aspectRatio: '1086 / 1130' }}>
        <img src="/hero/login-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />

        <form
          onSubmit={handleSubmit}
          className="absolute z-10 flex flex-col justify-center rounded-[26px] bg-white px-6 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
          style={{ top: '60.52%', left: '13.1%', width: '73.8%' }}
        >
          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[22%] bg-brand-green-light">
              <EnvelopeIcon className="h-6 w-6 text-brand-green-vivid" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-ink">Entrez votre email</h1>
              <p className="mt-1 text-sm text-muted">Nous vous enverrons un code pour continuer</p>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-2xl border-[1.5px] border-line px-4">
            <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-muted" />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent py-3 text-base text-ink placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>

          {error && <p className="mb-4 -mt-2 text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={!isValidEmail(email) || isSubmitting} className="w-full">
            {isSubmitting ? 'Envoi...' : 'Recevoir le code'}
          </Button>
        </form>
      </div>
    </div>
  )
}
