const fcfaFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export function formatFcfa(amount: number): string {
  return fcfaFormatter.format(amount)
}
