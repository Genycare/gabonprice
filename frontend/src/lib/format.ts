const fcfaFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export function formatFcfa(amount: number): string {
  return fcfaFormatter.format(amount)
}

export function initials(username: string): string {
  const clean = username.replace(/^user_/, '')
  return clean.slice(0, 2).toUpperCase()
}
