import { supabase } from './supabaseClient'

const POSTGREST_URL = import.meta.env.VITE_POSTGREST_URL

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Não autenticado')

  const res = await fetch(`${POSTGREST_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API error ${res.status}: ${error}`)
  }

  if (res.status === 204) return null
  return res.json()
}
