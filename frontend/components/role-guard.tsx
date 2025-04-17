"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-provider"
import { Loader2 } from "lucide-react"
import { AUTH_ENABLED } from "@/app/config"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("job_seeker" | "recruiter" | "admin")[]
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Skip auth check if auth is disabled
    if (!AUTH_ENABLED) return

    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Check if user has the required role
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      // Redirect based on role
      switch (user.role) {
        case "job_seeker":
          router.push("/dashboard")
          break
        case "recruiter":
          router.push("/recruiter/dashboard")
          break
        case "admin":
          router.push("/admin/dashboard")
          break
        default:
          router.push("/")
      }
    }
  }, [user, isLoading, router, allowedRoles])

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

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
