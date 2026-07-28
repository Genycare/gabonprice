import { supabase } from './supabase'
import type { Tables } from '../types/supabase'

export type Product = Tables<'products'>

export type PriceType = 'detail' | 'gros'

export type PriceWithContributor = Tables<'prices'> & {
  users: Pick<Tables<'users'>, 'username' | 'karma_score' | 'level'> | null
}

export interface ProductFilters {
  search?: string
  province?: string
  city?: string
  category?: string
}

// websearch_to_tsquery n'accepte que des mots complets : taper "sard" ne
// trouve pas "Sardine" tant que le mot n'est pas fini. On construit plutôt
// une requête à préfixe ("sard:*") pour que la recherche fonctionne au fur
// et à mesure de la frappe, comme un utilisateur s'y attend.
function buildPrefixTsQuery(text: string): string {
  const tokens = text
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)
  return tokens.map((token) => `${token}:*`).join(' & ')
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let productIds: string[] | null = null

  if (filters.province || filters.city) {
    let priceQuery = supabase.from('prices').select('product_id').eq('status', 'active')
    if (filters.province) priceQuery = priceQuery.eq('province', filters.province)
    if (filters.city) priceQuery = priceQuery.eq('city', filters.city)

    const { data, error } = await priceQuery
    if (error) throw error
    productIds = [...new Set(data.map((row) => row.product_id))]
    if (productIds.length === 0) return []
  }

  let query = supabase.from('products').select('*').order('name')
  if (filters.search) {
    const tsQuery = buildPrefixTsQuery(filters.search)
    if (tsQuery) {
      query = query.textSearch('search_vector', tsQuery, { config: 'french' })
    }
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (productIds) {
    query = query.in('id', productIds)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createProduct(name: string, category: string): Promise<Product> {
  const { data, error } = await supabase.from('products').insert({ name, category }).select().single()
  if (error) throw error
  return data
}

export async function fetchProduct(productId: string): Promise<Product> {
  const { data, error } = await supabase.from('products').select('*').eq('id', productId).single()
  if (error) throw error
  return data
}

export async function fetchProductPrices(productId: string, city?: string, priceType?: PriceType): Promise<PriceWithContributor[]> {
  let query = supabase
    .from('prices')
    .select('*, users(username, karma_score, level)')
    .eq('product_id', productId)
    .eq('status', 'active')
  if (city) query = query.eq('city', city)
  if (priceType) query = query.eq('price_type', priceType)
  const { data, error } = await query.order('amount', { ascending: true })
  if (error) throw error
  return data as unknown as PriceWithContributor[]
}

export type PriceHistoryPoint = Tables<'price_history'>

export async function fetchPriceHistory(productId: string, sinceDays = 7): Promise<PriceHistoryPoint[]> {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .gte('recorded_on', since)
    .order('recorded_on', { ascending: true })
  if (error) throw error
  return data
}

export type UserPrice = Tables<'prices'> & {
  products: Pick<Tables<'products'>, 'name' | 'category'> | null
}

export async function fetchUserPrices(userId: string): Promise<UserPrice[]> {
  const { data, error } = await supabase
    .from('prices')
    .select('*, products(name, category)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as UserPrice[]
}

export async function fetchPrice(priceId: string): Promise<Tables<'prices'>> {
  const { data, error } = await supabase.from('prices').select('*').eq('id', priceId).single()
  if (error) throw error
  return data
}

export type NewPrice = Pick<
  Tables<'prices'>,
  | 'product_id'
  | 'amount'
  | 'store_name'
  | 'province'
  | 'city'
  | 'neighborhood'
  | 'purchase_date'
  | 'latitude'
  | 'longitude'
  | 'photo_url'
  | 'price_type'
>

export async function createPrice(userId: string, price: NewPrice) {
  const { error } = await supabase.from('prices').insert({ ...price, user_id: userId })
  if (error) throw error
}

export async function updatePrice(priceId: string, price: NewPrice) {
  // product_id n'est jamais modifiable en édition (l'UI ne le propose pas) et n'est
  // plus accordé en écriture par GRANT UPDATE ; l'omettre évite une erreur de
  // permission même quand sa valeur reste inchangée (Postgres vérifie le privilège
  // colonne dès qu'elle apparaît dans le SET, pas seulement si la valeur change).
  const { product_id: _productId, ...updatable } = price
  const { error } = await supabase.from('prices').update(updatable).eq('id', priceId)
  if (error) throw error
}
