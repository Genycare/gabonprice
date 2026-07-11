import { supabase } from './supabase'

export async function fetchMyRatings(priceIds: string[], userId: string): Promise<Record<string, number>> {
  if (priceIds.length === 0) return {}
  const { data, error } = await supabase
    .from('price_ratings')
    .select('price_id, rating')
    .eq('user_id', userId)
    .in('price_id', priceIds)
  if (error) throw error
  return Object.fromEntries(data.map((r) => [r.price_id, r.rating]))
}

export async function setPriceRating(
  priceId: string,
  userId: string,
  rating: 1 | -1,
  currentRating: number | undefined,
): Promise<number | null> {
  if (currentRating === rating) {
    const { error } = await supabase.from('price_ratings').delete().eq('price_id', priceId).eq('user_id', userId)
    if (error) throw error
    return null
  }
  if (currentRating !== undefined) {
    const { error } = await supabase.from('price_ratings').update({ rating }).eq('price_id', priceId).eq('user_id', userId)
    if (error) throw error
    return rating
  }
  const { error } = await supabase.from('price_ratings').insert({ price_id: priceId, user_id: userId, rating })
  if (error) throw error
  return rating
}

export async function fetchMyReportedPriceIds(priceIds: string[], userId: string): Promise<string[]> {
  if (priceIds.length === 0) return []
  const { data, error } = await supabase
    .from('price_reports')
    .select('price_id')
    .eq('user_id', userId)
    .in('price_id', priceIds)
  if (error) throw error
  return data.map((r) => r.price_id)
}

export async function reportPrice(priceId: string, userId: string, reason: string) {
  const { error } = await supabase.from('price_reports').insert({ price_id: priceId, user_id: userId, reason })
  if (error) throw error
}
