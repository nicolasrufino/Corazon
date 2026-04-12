import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from '@/config/env'

let _supabase: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error(
          'Supabase credentials missing. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
        )
      }
      _supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
    }
    return (_supabase as unknown as Record<string, unknown>)[prop as string]
  },
})
