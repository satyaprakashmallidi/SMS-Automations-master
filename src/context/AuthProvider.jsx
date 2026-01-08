import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import { supabase } from '../services/supabase'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    )

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      setUser(data.user)
      setIsAuthenticated(true)

      return data.user
    } catch (error) {
      // Map Supabase errors to user-friendly messages
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password')
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if error
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) throw error

      // Supabase auto-authenticates after signup
      if (data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
      }

      return data.user
    } catch (error) {
      // Map Supabase errors to user-friendly messages
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new Error('Email already registered')
      }
      throw error
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}
