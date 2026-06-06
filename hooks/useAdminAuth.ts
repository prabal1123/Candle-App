// hooks/useAdminAuth.ts
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

type AuthState = 'loading' | 'admin' | 'unauthorized' | 'unauthenticated'

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setState('unauthenticated')
        return
      }

      const { data } = await supabase
        .from('users_profile')
        .select('role')
        .eq('id', session.user.id)
        .single()

      setState(data?.role === 'admin' ? 'admin' : 'unauthorized')
    }

    check()

    const { data: listener } = supabase.auth.onAuthStateChange(() => check())
    return () => listener.subscription.unsubscribe()
  }, [])

  return state
}