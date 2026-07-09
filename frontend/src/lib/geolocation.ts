import { CITIES, provinceForCity } from './locations'

export interface DetectedLocation {
  latitude: number
  longitude: number
  city?: string
  province?: string
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60_000 },
    )
  })
}

// Reverse-geocodes via OpenStreetMap Nominatim (no API key, free for low-volume use —
// see https://operations.osmfoundation.org/policies/nominatim/). Fine for this MVP's
// traffic; revisit with a paid geocoder or self-hosted instance if volume grows.
async function reverseGeocode(latitude: number, longitude: number): Promise<{ city?: string; province?: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr`,
    )
    if (!res.ok) return {}
    const data = await res.json()
    const address = data.address ?? {}
    const candidates: string[] = [address.city, address.town, address.village, address.county, address.state].filter(Boolean)

    const city = CITIES.find((known) => candidates.some((candidate) => normalize(candidate) === normalize(known)))
    const province = city ? provinceForCity(city) : undefined
    return { city, province }
  } catch {
    return {}
  }
}

export async function detectLocation(): Promise<DetectedLocation | null> {
  const position = await getCurrentPosition()
  if (!position) return null

  const { latitude, longitude } = position.coords
  const { city, province } = await reverseGeocode(latitude, longitude)
  return { latitude, longitude, city, province }
}
