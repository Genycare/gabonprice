import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars manquantes (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Voir .env.example.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
