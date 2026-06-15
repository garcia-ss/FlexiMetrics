import type { DataSource } from './repositories/types'
import { mockDataSource } from './adapters/mock'

const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

/**
 * Active data source. Defaults to the offline mock adapter.
 * Set VITE_DATA_SOURCE=supabase (plus the Supabase env vars) to use the real backend.
 * The supabase adapter is imported lazily so the mock build never pulls it in.
 */
let active: DataSource = mockDataSource

if (source === 'supabase') {
  const { supabaseDataSource } = await import('./adapters/supabase')
  active = supabaseDataSource
}

export const data: DataSource = active
