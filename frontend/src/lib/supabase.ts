import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new Error('Supabase is not configured for this deployment.')
  }

  client = createClient(url, publishableKey)
  return client
}

export async function getAccessToken(): Promise<string> {
  const { data, error } = await getSupabaseClient().auth.getSession()
  if (error) throw error
  if (!data.session?.access_token) {
    throw new Error('Your session has expired. Sign in again.')
  }
  return data.session.access_token
}
