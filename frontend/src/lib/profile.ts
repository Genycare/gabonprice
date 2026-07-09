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
