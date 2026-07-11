export const PROVINCES = [
  'Estuaire',
  'Haut-Ogooué',
  'Moyen-Ogooué',
  'Ngounié',
  'Nyanga',
  'Ogooué-Ivindo',
  'Ogooué-Lolo',
  'Ogooué-Maritime',
  'Woleu-Ntem',
] as const

export const CITIES_BY_PROVINCE: Record<(typeof PROVINCES)[number], string[]> = {
  Estuaire: ['Libreville', 'Owendo', 'Akanda', 'Ntoum'],
  'Haut-Ogooué': ['Franceville', 'Moanda', 'Okondja'],
  'Moyen-Ogooué': ['Lambaréné', 'Ndjolé'],
  Ngounié: ['Mouila', 'Ndendé'],
  Nyanga: ['Tchibanga', 'Mayumba', 'Moabi'],
  'Ogooué-Ivindo': ['Makokou', 'Booué', 'Mékambo'],
  'Ogooué-Lolo': ['Koulamoutou', 'Lastoursville', 'Pana'],
  'Ogooué-Maritime': ['Port-Gentil', 'Omboué'],
  'Woleu-Ntem': ['Oyem', 'Bitam', 'Mitzic', 'Minvoul'],
}

export const CITIES = Object.values(CITIES_BY_PROVINCE).flat()

export function provinceForCity(city: string): string | undefined {
  const entry = Object.entries(CITIES_BY_PROVINCE).find(([, cities]) => cities.includes(city))
  return entry?.[0]
}
