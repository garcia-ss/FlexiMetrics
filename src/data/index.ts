import type { DataSource } from './repositories/types'
import { supabaseDataSource } from './adapters/supabase'

export const data: DataSource = supabaseDataSource
