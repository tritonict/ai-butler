'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
  user: Session['user'] | null
  role: string | null
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<string | null>(null)

  // Init session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch role after session change
  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!error && data) {
        setRole(data.role)
      }
    }

    fetchRole()
  }, [session])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, role }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)