import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

/**
 * Returns the Supabase client, creating it on first use.
 * Throws a clear error if env vars are missing (only relevant when
 * VITE_DATA_SOURCE=supabase).
 */
export function getSupabase(): SupabaseClient {
  if (client) return client
  if (!url || !anonKey) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, ' +
        'ou use VITE_DATA_SOURCE=mock.',
    )
  }
  client = createClient(url, anonKey)
  return client
}

export const isSupabaseConfigured = Boolean(url && anonKey)
