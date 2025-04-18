"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { authApi } from "@/lib/api/auth"

type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "job_seeker" | "recruiter" | "admin"
  is_email_verified: boolean
  bio?: string | null
  location?: string | null
  phone_number?: string | null
  website?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  profile_picture?: string | null
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string,
    role?: "job_seeker" | "recruiter" | "admin",
  ) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        if (!accessToken) {
          setIsLoading(false)
          return
        }
        
        // First verify the token is valid without fetching the full profile
        const isValid = await authApi.verifyToken(accessToken)
        
        if (isValid) {
          // Only fetch the user profile if the token is valid
          const userData = await authApi.getCurrentUser()
          setUser(userData)
          setIsLoading(false)
          return
        }
        
        // If token is not valid, try to refresh
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          try {
            const { access } = await authApi.refreshToken(refreshToken)
            localStorage.setItem("accessToken", access)
            
            // Verify the new token
            const isNewTokenValid = await authApi.verifyToken(access)
            
            if (isNewTokenValid) {
              const userData = await authApi.getCurrentUser()
              setUser(userData)
            } else {
              // If the new token is also invalid, logout
              localStorage.removeItem("accessToken")
              localStorage.removeItem("refreshToken")
            }
          } catch (refreshError) {
            // If refresh fails, logout
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
          }
        }
      } catch (error) {
        console.error("Authentication error:", error)
        // Clear tokens on error
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { access, refresh, user } = await authApi.login(email, password)
    localStorage.setItem("accessToken", access)
    localStorage.setItem("refreshToken", refresh)
    setUser(user)
    // No need to manually redirect here as we'll handle it in the login component
  }

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string,
    role: "job_seeker" | "recruiter" | "admin" = "job_seeker",
  ) => {
    const { access, refresh, user } = await authApi.register(
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role,
    )
    localStorage.setItem("accessToken", access)
    localStorage.setItem("refreshToken", refresh)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
