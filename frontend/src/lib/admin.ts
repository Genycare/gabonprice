import { supabase } from './supabase'
import type { Tables } from '../types/supabase'

export interface AdminStats {
  total_prices: number
  prices_last_7d: number
  active_contributors: number
  contributors_last_30d: number
  median_freshness_days: number
  removed_rate_pct: number
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_get_stats')
  if (error) throw error
  return data as unknown as AdminStats
}

export type ModerationPrice = Tables<'prices'> & {
  products: Pick<Tables<'products'>, 'name' | 'category'> | null
  users: Pick<Tables<'users'>, 'username' | 'karma_score'> | null
}

export async function fetchModerationQueue(status: 'flagged' | 'removed'): Promise<ModerationPrice[]> {
  const { data, error } = await supabase
    .from('prices')
    .select('*, products(name, category), users(username, karma_score)')
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as ModerationPrice[]
}

export type PendingReport = Tables<'price_reports'> & {
  prices:
    | (Pick<Tables<'prices'>, 'id' | 'amount' | 'store_name' | 'city' | 'province' | 'status'> & {
        products: Pick<Tables<'products'>, 'name' | 'category'> | null
      })
    | null
  users: Pick<Tables<'users'>, 'username' | 'karma_score'> | null
}

export async function fetchPendingReports(): Promise<PendingReport[]> {
  const { data, error } = await supabase
    .from('price_reports')
    .select('*, prices(id, amount, store_name, city, province, status, products(name, category)), users(username, karma_score)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as PendingReport[]
}

export async function restorePrice(priceId: string) {
  const { error } = await supabase.rpc('admin_restore_price', { p_price_id: priceId })
  if (error) throw error
}

export async function deletePriceForever(priceId: string) {
  const { error } = await supabase.rpc('admin_delete_price', { p_price_id: priceId })
  if (error) throw error
}

export async function banUser(userId: string) {
  const { error } = await supabase.rpc('admin_ban_user', { p_user_id: userId })
  if (error) throw error
}

export async function resolveReport(reportId: string) {
  const { error } = await supabase.rpc('admin_resolve_report', { p_report_id: reportId })
  if (error) throw error
}
