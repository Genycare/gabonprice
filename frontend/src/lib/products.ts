import { supabase } from './supabase'
import type { Tables } from '../types/supabase'

export type Product = Tables<'products'>

export type PriceWithContributor = Tables<'prices'> & {
  users: Pick<Tables<'users'>, 'username' | 'karma_score' | 'level'> | null
}

export interface ProductFilters {
  search?: string
  province?: string
  city?: string
  category?: string
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
    query = query.textSearch('search_vector', filters.search, { type: 'websearch', config: 'french' })
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

export async function fetchProductPrices(productId: string): Promise<PriceWithContributor[]> {
  const { data, error } = await supabase
    .from('prices')
    .select('*, users(username, karma_score, level)')
    .eq('product_id', productId)
    .eq('status', 'active')
    .order('amount', { ascending: true })
  if (error) throw error
  return data as unknown as PriceWithContributor[]
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
>

export async function createPrice(userId: string, price: NewPrice) {
  const { error } = await supabase.from('prices').insert({ ...price, user_id: userId })
  if (error) throw error
}

export async function updatePrice(priceId: string, price: NewPrice) {
  const { error } = await supabase.from('prices').update(price).eq('id', priceId)
  if (error) throw error
}
