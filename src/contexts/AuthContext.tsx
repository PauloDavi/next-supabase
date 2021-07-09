import { createContext, useState, useEffect, useContext } from 'react'

import { User, Session } from '@supabase/supabase-js'
import axios from 'axios'

import { supabase } from '../services/supabase'

interface AuthContextProps {
  user?: User
  session?: Session
}

export const AuthContext = createContext({} as AuthContextProps)

export function AuthContextProvider({ children }) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
