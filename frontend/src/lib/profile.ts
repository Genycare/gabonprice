import { supabase } from './supabase'
import { queryClient } from './queryClient'

export async function fetchMyProfile() {
  const { data, error } = await supabase.rpc('get_my_profile')
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  // Le cache TanStack Query persisté (localStorage) et le cache HTTP Workbox
  // survivent normalement à la session Supabase : sur un appareil partagé,
  // les données du compte précédent (email, contributions, votes) resteraient
  // visibles au prochain utilisateur jusqu'à expiration (24h).
  queryClient.clear()
  try {
    window.localStorage.removeItem('gabonprice:query-cache')
  } catch {
    // localStorage indisponible (mode privé strict) : rien à nettoyer
  }
  if ('caches' in window) {
    try {
      await Promise.all(['supabase-api', 'images'].map((name) => caches.delete(name)))
    } catch {
      // Cache Storage indisponible : rien à nettoyer
    }
  }
}

export async function updateMyProfile(userId: string, updates: { username?: string; preferred_province?: string | null }) {
  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  if (error) throw error
}

export async function deleteMyAccount() {
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
}
