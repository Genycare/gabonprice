export const CATEGORY_EMOJI: Record<string, string> = {
  Alimentaire: '🥖',
  Poissonnerie: '🐟',
  Boucherie: '🥩',
  'Fruits et légumes': '🥦',
  'Produits laitiers': '🥛',
  'Matières grasses': '🧈',
  'Produits sucrés': '🍬',
  Dessert: '🍰',
  Boissons: '🥤',
  'Épicerie & Céréales': '🌾',
  Conserves: '🥫',
  'Gaz & Énergie': '🔥',
  Construction: '🧱',
  Hygiène: '🧴',
  'Produits ménagers': '🧹',
  'Beauté & Cosmétique': '💄',
  Électronique: '📱',
  Électroménager: '🔌',
  Pharmacie: '💊',
  'Bébé & Puériculture': '🍼',
  Vêtements: '👕',
  Carburant: '⛽',
  'Papeterie & Fournitures scolaires': '✏️',
}

export function categoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? '🏷️'
}
