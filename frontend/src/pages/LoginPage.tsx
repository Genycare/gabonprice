import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'

function formatGabonPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 1) return digits
  if (digits.length <= 3) return `${digits.slice(0, 1)} ${digits.slice(1)}`
  if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3)}`
  if (digits.length <= 7) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
  return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

export function LoginPage() {
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const digitCount = phone.replace(/\D/g, '').length

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (digitCount !== 9) {
      setError('Entrez un numéro gabonais valide (9 chiffres).')
      return
    }
    setError(null)
    setIsSubmitting(true)
    const fullPhone = `+241${phone.replace(/\D/g, '')}`
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: fullPhone })
      if (otpError) {
        setError(
          otpError.message.includes('rate limit')
            ? 'Trop de tentatives. Réessayez dans quelques minutes.'
            : "Impossible d'envoyer le code. Vérifiez le numéro et réessayez.",
        )
        return
      }
      navigate('/verification', { state: { phone: fullPhone } })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-svh bg-white">
      <div className="relative w-full" style={{ aspectRatio: '1157 / 1158' }}>
        <img src="/hero/auth-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover" />

        <form
          onSubmit={handleSubmit}
          className="absolute z-10 rounded-[26px] bg-white px-6 pb-8 pt-8 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
          style={{ top: '63.73%', left: '13.1%', width: '73.9%' }}
        >
          <div className="mb-6 flex items-start gap-3.5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[22%] bg-brand-green-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-brand-green-vivid">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <circle cx="12" cy="18" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-ink">Entrez votre numéro de téléphone</h1>
              <p className="mt-1 text-sm text-muted">Nous vous enverrons un code pour continuer</p>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border-[1.5px] border-line pl-4 pr-1.5">
            <div className="flex items-center gap-1.5 border-r border-line py-3 pr-3">
              <div className="flex h-4.5 w-6.5 flex-col overflow-hidden rounded-[3px] border border-black/10">
                <span className="h-1/3 bg-brand-green-vivid" />
                <span className="h-1/3 bg-brand-gold" />
                <span className="h-1/3 bg-[#1E40AF]" />
              </div>
              <span className="text-base font-medium text-ink">+241</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="6 XX XX XX XX"
              maxLength={13}
              value={phone}
              onChange={(e) => setPhone(formatGabonPhone(e.target.value))}
              className="min-w-0 flex-1 border-none bg-transparent py-3 text-base tracking-wide text-ink placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>

          {error && <p className="mb-4 -mt-2 text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={digitCount !== 9 || isSubmitting} className="w-full">
            {isSubmitting ? 'Envoi...' : 'Recevoir le code'}
          </Button>
        </form>
      </div>
    </div>
  )
}
