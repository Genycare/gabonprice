import { supabase } from './supabase'

export async function fetchMyProfile() {
  const { data, error } = await supabase.rpc('get_my_profile')
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function updateMyProfile(userId: string, updates: { username?: string; preferred_province?: string | null }) {
  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  if (error) throw error
}

export async function deleteMyAccount() {
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
}
