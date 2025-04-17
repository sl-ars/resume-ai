import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { AuthProvider } from "@/lib/auth/auth-provider"
import EmailVerificationBanner from "@/components/email-verification-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Resume AI",
  description: "AI-powered resume builder and analyzer",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-[#f5f5f7]">
            <Navbar />
            <EmailVerificationBanner />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
