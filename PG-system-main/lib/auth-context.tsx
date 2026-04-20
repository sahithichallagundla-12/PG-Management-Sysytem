"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User } from "./data-store"

interface AuthContextType {
  currentUser: User | null
  guestEmail: string | null
  isGuest: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  setGuestSession: (email: string) => void
  clearGuestSession: () => void
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [guestEmail, setGuestEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("smartpg-user")
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem("smartpg-user")
      }
    }

    const savedGuest = localStorage.getItem("smartpg-guest-email")
    if (savedGuest) {
      setGuestEmail(savedGuest)
    }

    setLoading(false)
  }, [])

  const setGuestSession = useCallback((email: string) => {
    setGuestEmail(email)
    localStorage.setItem("smartpg-guest-email", email)
  }, [])

  const clearGuestSession = useCallback(() => {
    setGuestEmail(null)
    localStorage.removeItem("smartpg-guest-email")
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Call test-login API that validates bcrypt password
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || "Invalid email or password" }
      }
      
      setCurrentUser(data.user)
      localStorage.setItem("smartpg-user", JSON.stringify(data.user))
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem("smartpg-user")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        guestEmail,
        isGuest: !!guestEmail && !currentUser,
        login,
        setGuestSession,
        clearGuestSession,
        logout: () => {
          logout();
          clearGuestSession();
        },
        isAuthenticated: currentUser !== null,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
