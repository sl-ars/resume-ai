"use client"

import { useState, useEffect } from "react"
import { authApi } from "@/lib/api/auth"

type TokenVerificationStatus = {
  isValid: boolean
  isLoading: boolean
  error: Error | null
}

/**
 * A hook that verifies if the user's token is valid without fetching the full profile
 * Useful for lightweight authentication checks
 */
export function useTokenVerification(): TokenVerificationStatus {
  const [isValid, setIsValid] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const accessToken = localStorage.getItem("accessToken")
        
        if (!accessToken) {
          setIsValid(false)
          return
        }
        
        // Verify token validity
        const isTokenValid = await authApi.verifyToken(accessToken)
        
        if (isTokenValid) {
          setIsValid(true)
          return
        }
        
        // If token is invalid, try refresh
        const refreshToken = localStorage.getItem("refreshToken")
        
        if (refreshToken) {
          try {
            const { access } = await authApi.refreshToken(refreshToken)
            localStorage.setItem("accessToken", access)
            
            // Verify new token
            const isNewTokenValid = await authApi.verifyToken(access)
            setIsValid(isNewTokenValid)
          } catch (refreshError) {
            // If refresh fails, clear tokens
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setIsValid(false)
          }
        } else {
          setIsValid(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to verify token"))
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    verifyToken()
  }, [])
  
  return { isValid, isLoading, error }
} 