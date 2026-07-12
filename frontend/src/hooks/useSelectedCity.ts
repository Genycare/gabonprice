import { useState } from 'react'
import { CITIES } from '../lib/locations'

const STORAGE_KEY = 'gp_selected_city'
const DEFAULT_CITY = 'Libreville'

export function useSelectedCity() {
  const [city, setCityState] = useState<string>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored && (CITIES as readonly string[]).includes(stored) ? stored : DEFAULT_CITY
    } catch {
      return DEFAULT_CITY
    }
  })

  function setCity(next: string) {
    setCityState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage indisponible (mode privé strict)
    }
  }

  return [city, setCity] as const
}
