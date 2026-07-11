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

const DollarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
      <div className="relative w-full" style={{ aspectRatio: '1086 / 1449' }}>
        <img src="/hero/login-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />

        {/* Recouvre le 3e repère "Achats sécurisés" bake dans la photo par "Économisez au quotidien" */}
        <div className="absolute z-[8] flex flex-col gap-0.5 bg-white" style={{ top: '82%', left: '67.6%', width: '31%', height: '10.5%' }}>
          <div className="flex items-start gap-1">
            <DollarIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-green-vivid" />
            <div className="text-[11px] font-extrabold leading-tight text-ink">Économisez au quotidien</div>
          </div>
          <div className="text-[10px] leading-tight text-muted">Trouvez le meilleur prix avant d'acheter.</div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="absolute z-10 flex flex-col justify-center rounded-[20px] bg-white px-4 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
          style={{ top: '47.2%', left: '13.1%', width: '73.8%' }}
        >
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[22%] bg-brand-green-light">
              <EnvelopeIcon className="h-4.5 w-4.5 text-brand-green-vivid" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-ink">Entrez votre email</h1>
              <p className="mt-0.5 text-xs leading-tight text-muted">Nous vous enverrons un code pour continuer</p>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 rounded-xl border-[1.5px] border-line px-3">
            <EnvelopeIcon className="h-4 w-4 flex-shrink-0 text-muted" />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent py-2 text-sm text-ink placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>

          {error && <p className="mb-2 -mt-1 text-xs text-red-600">{error}</p>}

          <Button type="submit" disabled={!isValidEmail(email) || isSubmitting} className="w-full">
            {isSubmitting ? 'Envoi...' : 'Recevoir le code'}
          </Button>
        </form>
      </div>
    </div>
  )
}
