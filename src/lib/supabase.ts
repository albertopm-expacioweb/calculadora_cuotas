import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client

  const enabled = import.meta.env.VITE_ENABLE_AUTH === 'true'
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!enabled) {
    throw new Error('Auth disabled')
  }
  if (!url || !anonKey) {
    throw new Error('Supabase env missing')
  }

  client = createClient(url, anonKey)
  return client
}