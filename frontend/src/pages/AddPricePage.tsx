import { Link } from 'react-router-dom'

const PROVINCES = ['Estuaire', 'Ogooué-Maritime', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié']
const CITIES = ['Libreville', 'Port-Gentil', 'Franceville', 'Lambaréné', 'Mouila']

export function AddPricePage() {
  return (
    <div className="pb-28">
      <div className="sticky top-0 z-40 flex items-center gap-3.5 border-b border-line bg-white px-4.5 py-4">
        <Link
          to="/"
          className="flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-app-bg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-ink">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>
        <div className="flex-1 text-[17px] font-extrabold text-ink">Ajouter un prix</div>
      </div>

      <form className="flex flex-col gap-5 px-4.5 py-5">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Produit <span className="text-brand-green-vivid">*</span>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-line bg-white px-4 py-3">
            <div className="flex h-11.5 w-11.5 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green-light text-2xl">
              🍚
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-ink">Riz parfumé 5 kg</div>
              <div className="text-xs text-muted">Alimentaire</div>
            </div>
            <button type="button" className="text-xs font-bold text-brand-green-vivid">
              Changer
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Prix payé <span className="text-brand-green-vivid">*</span>
          </div>
          <div className="relative">
            <input
              type="tel"
              placeholder="0"
              defaultValue="4 500"
              className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 pr-15 text-[22px] font-extrabold text-brand-green focus:border-brand-green-vivid focus:shadow-[0_0_0_4px_rgba(22,163,74,0.1)] focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-muted">FCFA</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Magasin <span className="text-brand-green-vivid">*</span>
          </div>
          <input
            type="text"
            placeholder="Ex : Mbolo, Cecado, Marché Mont-Bouët..."
            defaultValue="Mbolo"
            className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-[#9CA3AF] focus:border-brand-green-vivid focus:shadow-[0_0_0_4px_rgba(22,163,74,0.1)] focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Localisation <span className="text-brand-green-vivid">*</span>
          </div>
          <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-[#86EFAC] bg-[#DCFCE7] px-3.5 py-2.75">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 flex-shrink-0 text-brand-green">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="flex-1 text-[13px] font-semibold text-[#15803D]">Position détectée : Libreville · Glass</span>
            <button type="button" className="text-xs font-bold text-brand-green">
              Modifier
            </button>
          </div>
          <div className="relative mb-3 text-center text-xs font-semibold text-muted">— ou saisir manuellement —</div>
          <div className="grid grid-cols-2 gap-2.5">
            <select className="rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none">
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select className="rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none">
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Quartier (ex : Glass, Akébé, Nombakélé)"
              className="col-span-2 rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-[#9CA3AF] focus:border-brand-green-vivid focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Date d'achat <span className="text-brand-green-vivid">*</span>
          </div>
          <input
            type="text"
            placeholder="jj/mm/aaaa"
            defaultValue="06/07/2026"
            className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Photo du ticket <span className="text-[11px] font-semibold text-muted">(optionnel)</span>
          </div>
          <button
            type="button"
            className="w-full rounded-2xl border-[1.5px] border-dashed border-line bg-white px-4 py-6.5 text-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2.5 h-8.5 w-8.5 text-brand-green-vivid"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <div className="mb-0.5 text-sm font-bold text-ink">Ajouter une photo du ticket</div>
            <div className="text-xs text-muted">Renforce la confiance de la communauté</div>
          </button>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-white px-4.5 pb-5 pt-3.5">
        <button
          type="submit"
          className="w-full rounded-2xl bg-brand-green py-4.25 text-[17px] font-extrabold text-white hover:bg-[#0f5c38]"
        >
          Publier le prix
        </button>
        <div className="mt-2 text-center text-[11px] text-muted">
          Votre prix sera visible immédiatement et vérifié par la communauté
        </div>
      </div>
    </div>
  )
}
