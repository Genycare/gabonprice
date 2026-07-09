export const CATEGORY_EMOJI: Record<string, string> = {
  Alimentaire: '🥖',
  'Gaz & Énergie': '🔥',
  Construction: '🧱',
  Hygiène: '🧴',
  Électronique: '📱',
  Pharmacie: '💊',
  Vêtements: '👕',
  Carburant: '⛽',
}

export function categoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? '🏷️'
}
