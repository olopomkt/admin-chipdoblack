import { useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'
import { apiFetch } from '../config/api'
import type { AdminUser } from '../types'

interface AuthState {
  loading: boolean
  authenticated: boolean
  admin: AdminUser | null
  error: string | null
}

export function useAdmin() {
  const [state, setState] = useState<AuthState>({
    loading: true,
    authenticated: false,
    admin: null,
    error: null,
  })

  useEffect(() => {
    checkAdmin()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkAdmin() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setState({ loading: false, authenticated: false, admin: null, error: null })
        return
      }

      const email = session.user.email
      const admins: AdminUser[] = await apiFetch(`/admin_users?email=eq.${email}`)

      if (!admins || admins.length === 0) {
        await supabase.auth.signOut()
        setState({
          loading: false,
          authenticated: false,
          admin: null,
          error: 'Acesso negado. Você não é administrador.',
        })
        return
      }

      setState({
        loading: false,
        authenticated: true,
        admin: admins[0],
        error: null,
      })
    } catch {
      setState({
        loading: false,
        authenticated: false,
        admin: null,
        error: 'Erro ao verificar permissões.',
      })
    }
  }

  async function login(email: string, password: string) {
    setState(s => ({ ...s, loading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }))
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setState({ loading: false, authenticated: false, admin: null, error: null })
  }

  return { ...state, login, logout }
}
