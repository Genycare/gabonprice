import { z } from 'zod'

export const priceFormSchema = z.object({
  productId: z.string().min(1, 'Choisissez un produit.'),
  amount: z.coerce.number().positive('Le prix doit être positif.'),
  storeName: z.string().trim().min(2, 'Nom du magasin trop court.'),
  province: z.string().min(1, 'Choisissez une province.'),
  city: z.string().min(1, 'Choisissez une ville.'),
  neighborhood: z.string().trim().optional(),
  purchaseDate: z.coerce.date().max(new Date(), 'La date ne peut pas être dans le futur.'),
})

export type PriceFormValues = z.input<typeof priceFormSchema>
