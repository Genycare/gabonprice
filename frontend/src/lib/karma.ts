const LEVELS = [
  { label: 'Débutant', min: 0 },
  { label: 'Contributeur', min: 100 },
  { label: 'Confirmé', min: 500 },
  { label: 'Expert', min: 2000 },
] as const

export function levelProgress(karma: number) {
  const index = LEVELS.findIndex((l, i) => karma >= l.min && (i === LEVELS.length - 1 || karma < LEVELS[i + 1].min))
  const current = LEVELS[index]
  const next = LEVELS[index + 1]

  if (!next) {
    return { current: current.label, next: null, percent: 100, karma, nextMin: null }
  }

  const percent = Math.round(((karma - current.min) / (next.min - current.min)) * 100)
  return { current: current.label, next: next.label, percent, karma, nextMin: next.min }
}
