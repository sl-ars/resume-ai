"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/components/ui/use-toast"

export default function EmailVerificationBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()

  // Don't show banner if user is verified or banner was dismissed
  if (!user || user.is_email_verified || dismissed) {
    return null
  }

  const handleResendVerification = async () => {
    try {
      setIsResending(true)
      await authApi.resendVerificationEmail()
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Alert className="rounded-none border-t border-b border-yellow-200 bg-yellow-50">
      <div className="container mx-auto flex items-center justify-between py-2">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
          <AlertDescription className="text-yellow-800">
            Please verify your email address to access all features.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-yellow-300 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </Alert>
  )
}
