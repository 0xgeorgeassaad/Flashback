/* oxlint-disable react/only-export-components, react/set-state-in-effect */
import type { User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'configuration-error'

type AuthResult = {
  error: string | null
  confirmationRequired?: boolean
}

type AuthContextValue = {
  status: AuthStatus
  user: User | null
  error: string | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}

    try {
      const supabase = getSupabaseClient()
      void supabase.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active) return
        if (sessionError) {
          setError(sessionError.message)
          setStatus('anonymous')
          return
        }
        setUser(data.session?.user ?? null)
        setStatus(data.session ? 'authenticated' : 'anonymous')
      })

      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return
        setUser(session?.user ?? null)
        setStatus(session ? 'authenticated' : 'anonymous')
        setError(null)
      })
      unsubscribe = () => listener.data.subscription.unsubscribe()
    } catch (configurationError) {
      setError(
        configurationError instanceof Error
          ? configurationError.message
          : 'Authentication is not configured.',
      )
      setStatus('configuration-error')
    }

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    })
    return { error: signInError?.message ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error: signUpError } = await getSupabaseClient().auth.signUp({ email, password })
    return {
      error: signUpError?.message ?? null,
      confirmationRequired: !signUpError && !data.session,
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error: signOutError } = await getSupabaseClient().auth.signOut()
    if (signOutError) setError(signOutError.message)
  }, [])

  const value = useMemo(
    () => ({ status, user, error, signIn, signUp, signOut }),
    [status, user, error, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
