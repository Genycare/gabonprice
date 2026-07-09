export const PROVINCES = ['Estuaire', 'Ogooué-Maritime', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié'] as const

export const CITIES_BY_PROVINCE: Record<(typeof PROVINCES)[number], string[]> = {
  Estuaire: ['Libreville', 'Owendo', 'Akanda', 'Ntoum'],
  'Ogooué-Maritime': ['Port-Gentil', 'Omboué'],
  'Haut-Ogooué': ['Franceville', 'Moanda', 'Okondja'],
  'Moyen-Ogooué': ['Lambaréné', 'Ndjolé'],
  Ngounié: ['Mouila', 'Ndendé'],
}

export const CITIES = Object.values(CITIES_BY_PROVINCE).flat()

export function provinceForCity(city: string): string | undefined {
  const entry = Object.entries(CITIES_BY_PROVINCE).find(([, cities]) => cities.includes(city))
  return entry?.[0]
}
