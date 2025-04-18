"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-provider"
import { Loader2 } from "lucide-react"
import { AUTH_ENABLED, ENABLE_ADMIN_FEATURES } from "@/app/config"

interface AuthGuardProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Skip auth check if auth is disabled
    if (!AUTH_ENABLED) return

    if (!isLoading && !user) {
      router.push("/login")
    }

    // Skip admin check if admin features are disabled
    if (!ENABLE_ADMIN_FEATURES) return

    if (adminOnly && !isLoading && user && !user.is_admin) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router, adminOnly])

  // Skip auth check if auth is disabled
  if (!AUTH_ENABLED) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
      </div>
    )
  }

  if (!user || (adminOnly && ENABLE_ADMIN_FEATURES && !user.is_admin)) {
    return null
  }

  return <>{children}</>
}
