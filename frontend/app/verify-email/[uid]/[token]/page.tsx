"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth/auth-provider"

export default function VerifyEmailPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()


  useEffect(() => {
    if (user && user.is_email_verified) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    const verifyEmail = async () => {
      const uid = params.uid as string
      const token = params.token as string

      if (!uid || !token) {
        setError("Invalid verification link. Please request a new one.")
        setIsLoading(false)
        return
      }

      try {
        await authApi.verifyEmail(token, uid)
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to verify email. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [params])

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md border-none shadow-sm rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0071e3] mx-auto mb-4" />
              <p>Verifying your email address...</p>
            </div>
          ) : error ? (
            <div className="space-y-4 w-full">
              <Alert variant="destructive" className="mb-4 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Link href="/login">
                <Button className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">Go to Login</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <Alert className="mb-4 rounded-xl bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Your email has been verified successfully.
                </AlertDescription>
              </Alert>
              <p className="text-center text-gray-600 mb-4">
                You can now log in to your account with your verified email.
              </p>
              <Link href="/login">
                <Button className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">Go to Login</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
