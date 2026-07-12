import { PROVINCES, CITIES_BY_PROVINCE } from '../lib/locations'

interface CityPickerProps {
  selectedCity: string
  onSelect: (city: string) => void
  onClose: () => void
}

export function CityPicker({ selectedCity, onSelect, onClose }: CityPickerProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choisir une ville"
      onClick={onClose}
      className="fixed inset-0 z-9999 flex items-end justify-center bg-ink/55"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[75vh] w-full max-w-110 overflow-y-auto rounded-t-3xl bg-white px-5.5 pb-8 pt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
      >
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-app-bg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-4 w-4 text-muted">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="mb-4 text-[19px] font-extrabold text-ink">Choisir une ville</h2>

        <div className="flex flex-col gap-4.5">
          {PROVINCES.map((province) => (
            <div key={province}>
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">{province}</h3>
              <div className="flex flex-wrap gap-2">
                {CITIES_BY_PROVINCE[province].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      onSelect(city)
                      onClose()
                    }}
                    className={`rounded-full border-[1.5px] px-3.5 py-2 text-sm font-semibold ${
                      city === selectedCity
                        ? 'border-brand-green-light bg-brand-green-light text-brand-green'
                        : 'border-line bg-white text-ink'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
