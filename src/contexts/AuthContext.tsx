import { createContext, useState, useEffect, useContext } from 'react'

import { User, Session } from '@supabase/supabase-js'
import axios from 'axios'
import { useRouter } from 'next/router'

import { supabase } from '../services/supabase'

interface AuthContextProps {
  user?: User
  session?: Session
  login: () => void
  logout: () => void
}

export const AuthContext = createContext({} as AuthContextProps)

export function AuthContextProvider({ children }) {
  const router = useRouter()

  const [user, setUser] = useState<User>()
  const [session, setSession] = useState<Session>()

  useEffect(() => {
    const currentSession = supabase.auth.session()

    if (currentSession) {
      setSession(currentSession)
      setUser(currentSession.user)
    }

    const { data } = supabase.auth.onAuthStateChange((event, newSection) => {
      setSession(newSection)
      setUser(newSection?.user)

      axios.post('/api/auth', { event, session: newSection })
    })

    return () => {
      data.unsubscribe()
    }
  }, [])

  async function login() {
    const { error } = await supabase.auth.signIn(
      { provider: 'github' },
      { redirectTo: 'http://localhost:3000/todos' }
    )

    if (error) {
      return
    }
  }

  async function logout() {
    await supabase.auth.signOut()

    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
