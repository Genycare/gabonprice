import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  createPrice,
  createProduct,
  fetchPrice,
  fetchProduct,
  fetchProducts,
  updatePrice,
  type Product,
} from '../lib/products'
import { CATEGORY_EMOJI, categoryEmoji } from '../lib/categories'
import { priceFormSchema } from '../lib/priceSchema'
import { PROVINCES, CITIES_BY_PROVINCE } from '../lib/locations'
import { detectLocation } from '../lib/geolocation'
import { compressImage, uploadPricePhoto } from '../lib/photo'
import { useSession } from '../hooks/useSession'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { enqueuePrice } from '../lib/offlineQueue'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

type LocationStatus = 'detecting' | 'detected' | 'unavailable'

export function AddPricePage() {
  const navigate = useNavigate()
  const { session } = useSession()
  const isOnline = useOnlineStatus()
  const [searchParams] = useSearchParams()
  const editPriceId = searchParams.get('edit')

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productQuery, setProductQuery] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(!editPriceId)
  const [newProductCategory, setNewProductCategory] = useState('')
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [createProductError, setCreateProductError] = useState<string | null>(null)

  const [amount, setAmount] = useState('')
  const [storeName, setStoreName] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(todayIso())
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(editPriceId ? 'unavailable' : 'detecting')
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null)

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!editPriceId) return
    fetchPrice(editPriceId).then(async (price) => {
      if (session && price.user_id !== session.user.id) {
        navigate('/', { replace: true })
        return
      }
      const product = await fetchProduct(price.product_id)
      setSelectedProduct(product)
      setAmount(String(price.amount))
      setStoreName(price.store_name)
      setProvince(price.province)
      setCity(price.city)
      setNeighborhood(price.neighborhood ?? '')
      setPurchaseDate(price.purchase_date)
      setPhotoUrl(price.photo_url)
      if (price.latitude != null && price.longitude != null) {
        setCoords({ latitude: price.latitude, longitude: price.longitude })
      }
    }, () => setSubmitError("Modification indisponible hors ligne. Réessayez avec une connexion."))
  }, [editPriceId, session, navigate])

  useEffect(() => {
    if (editPriceId) return
    let cancelled = false
    detectLocation().then((detected) => {
      if (cancelled) return
      if (!detected) {
        setLocationStatus('unavailable')
        return
      }
      setCoords({ latitude: detected.latitude, longitude: detected.longitude })
      if (detected.city && detected.province) {
        setProvince(detected.province)
        setCity(detected.city)
        setDetectedLabel(`${detected.city}, ${detected.province}`)
        setLocationStatus('detected')
      } else {
        setLocationStatus('unavailable')
      }
    })
    return () => {
      cancelled = true
    }
  }, [editPriceId])

  const { data: productResults } = useQuery({
    queryKey: ['product-search', productQuery],
    queryFn: () => fetchProducts({ search: productQuery }),
    enabled: showProductSearch && productQuery.trim().length >= 2,
  })

  const cityOptions = province ? CITIES_BY_PROVINCE[province as keyof typeof CITIES_BY_PROVINCE] : []

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoUrl(null)
  }

  async function handleCreateProduct() {
    const name = productQuery.trim()
    if (!name || !newProductCategory) return
    setCreateProductError(null)
    setIsCreatingProduct(true)
    try {
      const product = await createProduct(name, newProductCategory)
      setSelectedProduct(product)
      setShowProductSearch(false)
      setProductQuery('')
      setNewProductCategory('')
    } catch {
      setCreateProductError("Impossible de créer ce produit. Réessayez.")
    } finally {
      setIsCreatingProduct(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const parsed = priceFormSchema.safeParse({
      productId: selectedProduct?.id ?? '',
      amount,
      storeName,
      province,
      city,
      neighborhood: neighborhood || undefined,
      purchaseDate,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)

    try {
      if (!isOnline && !editPriceId && session) {
        const payload = {
          product_id: parsed.data.productId,
          amount: parsed.data.amount,
          store_name: parsed.data.storeName,
          province: parsed.data.province,
          city: parsed.data.city,
          neighborhood: parsed.data.neighborhood ?? null,
          purchase_date: parsed.data.purchaseDate.toISOString().slice(0, 10),
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          photo_url: null,
        }
        enqueuePrice({
          userId: session.user.id,
          price: payload,
          productName: selectedProduct!.name,
          productCategory: selectedProduct!.category,
        })
        navigate('/confirmation', {
          state: {
            productId: parsed.data.productId,
            productName: selectedProduct!.name,
            productCategory: selectedProduct!.category,
            amount: parsed.data.amount,
            storeName: parsed.data.storeName,
            city: parsed.data.city,
            neighborhood: parsed.data.neighborhood,
            pending: true,
          },
        })
        return
      }

      let finalPhotoUrl = photoUrl
      if (photoFile && session) {
        setIsUploadingPhoto(true)
        const compressed = await compressImage(photoFile)
        finalPhotoUrl = await uploadPricePhoto(session.user.id, compressed)
        setIsUploadingPhoto(false)
      }

      const payload = {
        product_id: parsed.data.productId,
        amount: parsed.data.amount,
        store_name: parsed.data.storeName,
        province: parsed.data.province,
        city: parsed.data.city,
        neighborhood: parsed.data.neighborhood ?? null,
        purchase_date: parsed.data.purchaseDate.toISOString().slice(0, 10),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        photo_url: finalPhotoUrl,
      }

      if (editPriceId) {
        await updatePrice(editPriceId, payload)
        navigate(`/produit/${parsed.data.productId}`)
      } else if (session) {
        await createPrice(session.user.id, payload)
        navigate('/confirmation', {
          state: {
            productId: parsed.data.productId,
            productName: selectedProduct!.name,
            productCategory: selectedProduct!.category,
            amount: parsed.data.amount,
            storeName: parsed.data.storeName,
            city: parsed.data.city,
            neighborhood: parsed.data.neighborhood,
          },
        })
      }
    } catch {
      setSubmitError("Impossible d'enregistrer le prix. Réessayez.")
    } finally {
      setIsSubmitting(false)
      setIsUploadingPhoto(false)
    }
  }

  const currentPhotoPreview = photoPreview ?? photoUrl

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
        <div className="flex-1 text-[17px] font-extrabold text-ink">{editPriceId ? 'Modifier le prix' : 'Ajouter un prix'}</div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4.5 py-5">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Produit <span className="text-brand-green-vivid">*</span>
          </div>

          {selectedProduct && !showProductSearch ? (
            <div className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-line bg-white px-4 py-3">
              <div className="flex h-11.5 w-11.5 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green-light text-2xl">
                {categoryEmoji(selectedProduct.category)}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-ink">{selectedProduct.name}</div>
                <div className="text-xs text-muted">{selectedProduct.category}</div>
              </div>
              <button type="button" onClick={() => setShowProductSearch(true)} className="text-xs font-bold text-brand-green-vivid">
                Changer
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Rechercher un produit (ex : riz, gaz, ciment...)"
                className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-[#9CA3AF] focus:border-brand-green-vivid focus:outline-none"
              />
              {productQuery.trim().length >= 2 && (productResults?.length ?? 0) > 0 && (
                <div className="absolute z-10 mt-1.5 w-full rounded-2xl border border-line bg-white p-1.5 shadow-lg">
                  {productResults!.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p)
                        setShowProductSearch(false)
                        setProductQuery('')
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-app-bg"
                    >
                      <span className="text-lg">{categoryEmoji(p.category)}</span>
                      <span className="text-sm font-semibold text-ink">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {productQuery.trim().length >= 2 && productResults && productResults.length === 0 && (
                <div className="mt-2.5 rounded-2xl border border-dashed border-line bg-app-bg p-3.5">
                  <p className="mb-2.5 text-sm text-ink">
                    Aucun produit trouvé pour « <b>{productQuery.trim()}</b> ».
                  </p>
                  <div className="mb-2.5 grid grid-cols-4 gap-2">
                    {Object.entries(CATEGORY_EMOJI).map(([label, emoji]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setNewProductCategory(label)}
                        className={`rounded-xl border-[1.5px] px-1 py-2.5 text-center ${
                          newProductCategory === label ? 'border-brand-green-vivid bg-brand-green-light' : 'border-line bg-white'
                        }`}
                      >
                        <span className="block text-lg">{emoji}</span>
                        <span className="text-[9px] font-semibold leading-tight text-ink">{label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!newProductCategory || isCreatingProduct}
                    onClick={handleCreateProduct}
                    className="w-full rounded-xl bg-brand-green py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {isCreatingProduct ? 'Création...' : `Créer « ${productQuery.trim()} » comme nouveau produit`}
                  </button>
                  {createProductError && <p className="mt-2 text-xs text-red-600">{createProductError}</p>}
                </div>
              )}
            </div>
          )}
          {errors.productId && <p className="mt-1.5 text-xs text-red-600">{errors.productId}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Prix payé <span className="text-brand-green-vivid">*</span>
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 pr-15 text-[22px] font-extrabold text-brand-green focus:border-brand-green-vivid focus:shadow-[0_0_0_4px_rgba(22,163,74,0.1)] focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-muted">FCFA</span>
          </div>
          {errors.amount && <p className="mt-1.5 text-xs text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Magasin <span className="text-brand-green-vivid">*</span>
          </div>
          <input
            type="text"
            placeholder="Ex : Mbolo, Cecado, Marché Mont-Bouët..."
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-[#9CA3AF] focus:border-brand-green-vivid focus:shadow-[0_0_0_4px_rgba(22,163,74,0.1)] focus:outline-none"
          />
          {errors.storeName && <p className="mt-1.5 text-xs text-red-600">{errors.storeName}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Localisation <span className="text-brand-green-vivid">*</span>
          </div>

          {locationStatus === 'detecting' && (
            <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-line bg-app-bg px-3.5 py-2.75 text-[13px] font-semibold text-muted">
              Détection de votre position...
            </div>
          )}
          {locationStatus === 'detected' && detectedLabel && (
            <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-[#86EFAC] bg-[#DCFCE7] px-3.5 py-2.75">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 flex-shrink-0 text-brand-green">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="flex-1 text-[13px] font-semibold text-[#15803D]">Position détectée : {detectedLabel}</span>
            </div>
          )}
          {locationStatus === 'unavailable' && !editPriceId && (
            <div className="mb-3 text-center text-xs font-semibold text-muted">— Sélectionnez votre position —</div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value)
                setCity('')
              }}
              className="rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none"
            >
              <option value="">Province...</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!province}
              className="rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none disabled:opacity-50"
            >
              <option value="">Ville...</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Quartier (ex : Glass, Akébé, Nombakélé)"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="col-span-2 rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-[#9CA3AF] focus:border-brand-green-vivid focus:outline-none"
            />
          </div>
          {(errors.province || errors.city) && (
            <p className="mt-1.5 text-xs text-red-600">{errors.province || errors.city}</p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Date d'achat <span className="text-brand-green-vivid">*</span>
          </div>
          <input
            type="date"
            max={todayIso()}
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3.5 text-[15px] text-ink focus:border-brand-green-vivid focus:outline-none"
          />
          {errors.purchaseDate && <p className="mt-1.5 text-xs text-red-600">{errors.purchaseDate}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            Photo du ticket <span className="text-[11px] font-semibold text-muted">(optionnel)</span>
          </div>
          {!isOnline ? (
            <p className="text-xs text-muted">Indisponible hors ligne — votre prix sera publié sans photo.</p>
          ) : currentPhotoPreview ? (
            <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-line">
              <img src={currentPhotoPreview} alt="Ticket" className="h-40 w-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white"
              >
                Retirer
              </button>
            </div>
          ) : (
            <label className="block w-full cursor-pointer rounded-2xl border-[1.5px] border-dashed border-line bg-white px-4 py-6.5 text-center">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
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
            </label>
          )}
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-white px-4.5 pb-5 pt-3.5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-brand-green py-4.25 text-[17px] font-extrabold text-white hover:bg-[#0f5c38] disabled:opacity-60"
          >
            {isUploadingPhoto
              ? 'Envoi de la photo...'
              : isSubmitting
                ? 'Enregistrement...'
                : editPriceId
                  ? 'Enregistrer les modifications'
                  : !isOnline
                    ? 'Enregistrer (hors ligne)'
                    : 'Publier le prix'}
          </button>
          <div className="mt-2 text-center text-[11px] text-muted">
            {isOnline
              ? 'Votre prix sera visible immédiatement et vérifié par la communauté'
              : 'Hors ligne : votre prix sera publié automatiquement à la reconnexion'}
          </div>
        </div>
      </form>
    </div>
  )
}
