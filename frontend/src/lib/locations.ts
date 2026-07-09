export const PROVINCES = ['Estuaire', 'Ogooué-Maritime', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié'] as const

export const CITIES_BY_PROVINCE: Record<(typeof PROVINCES)[number], string[]> = {
  Estuaire: ['Libreville', 'Owendo', 'Akanda', 'Ntoum'],
  'Ogooué-Maritime': ['Port-Gentil', 'Omboué'],
  'Haut-Ogooué': ['Franceville', 'Moanda', 'Okondja'],
  'Moyen-Ogooué': ['Lambaréné', 'Ndjolé'],
  Ngounié: ['Mouila', 'Ndendé'],
}

export const CITIES = Object.values(CITIES_BY_PROVINCE).flat()
