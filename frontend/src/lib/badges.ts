import { LEVELS } from './karma'

export interface BadgeStats {
  karma: number
  priceCount: number
  provinceCount: number
  categoryCount: number
}

export interface Badge {
  id: string
  emoji: string
  label: string
  description: string
  isUnlocked: (stats: BadgeStats) => boolean
}

const CONTRIBUTION_BADGES: Badge[] = [
  { id: 'first-price', emoji: '🌱', label: 'Premier prix', description: 'Publiez votre premier prix', isUnlocked: (s) => s.priceCount >= 1 },
  { id: 'prices-10', emoji: '📦', label: '10 prix', description: 'Publiez 10 prix', isUnlocked: (s) => s.priceCount >= 10 },
  { id: 'prices-50', emoji: '🏗️', label: '50 prix', description: 'Publiez 50 prix', isUnlocked: (s) => s.priceCount >= 50 },
  { id: 'provinces-3', emoji: '🗺️', label: 'Explorateur', description: 'Contribuez dans 3 provinces différentes', isUnlocked: (s) => s.provinceCount >= 3 },
  { id: 'categories-5', emoji: '🎯', label: 'Polyvalent', description: 'Contribuez dans 5 catégories différentes', isUnlocked: (s) => s.categoryCount >= 5 },
]

const LEVEL_BADGES: Badge[] = LEVELS.slice(1).map((l) => ({
  id: `level-${l.label.toLowerCase()}`,
  emoji: l.label === 'Contributeur' ? '⭐' : l.label === 'Confirmé' ? '🥈' : '🥇',
  label: l.label,
  description: `Atteignez le niveau ${l.label}`,
  isUnlocked: (s: BadgeStats) => s.karma >= l.min,
}))

export const BADGES: Badge[] = [...CONTRIBUTION_BADGES, ...LEVEL_BADGES]

export function unlockedBadgeIds(stats: BadgeStats): Set<string> {
  return new Set(BADGES.filter((b) => b.isUnlocked(stats)).map((b) => b.id))
}
