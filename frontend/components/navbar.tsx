"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AUTH_ENABLED, ENABLE_ADMIN_FEATURES } from "@/app/config"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building, Briefcase, Users, ChevronDown } from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if auth is enabled and user is null
    if (AUTH_ENABLED && !user) {
      return
    }
  }, [user, router])

  // Navigation links for employer/recruiter role
  const employerLinks = [
    { href: "/recruiter/dashboard", label: "Dashboard" },
    { href: "/recruiter/company", label: "My Company", icon: <Building className="h-4 w-4 mr-2" /> },
    { href: "/recruiter/jobs", label: "Jobs", icon: <Briefcase className="h-4 w-4 mr-2" /> },
    { href: "/recruiter/applicants", label: "Applicants", icon: <Users className="h-4 w-4 mr-2" /> },
  ]

  // Navigation links for job seeker role
  const jobSeekerLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/companies", label: "Companies" },
  ]

  // Navigation links for admin role
  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/companies", label: "Companies" },
  ]

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Resume AI
        </Link>

        <div className="flex items-center space-x-4">
          {AUTH_ENABLED ? (
            user ? (
              <>
                {user.role === "recruiter" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center">
                        Employer <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {employerLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link href={link.href} className="flex items-center">
                            {link.icon}
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {user.role === "job_seeker" && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <Link href="/jobs">
                      <Button variant="ghost">Jobs</Button>
                    </Link>
                    <Link href="/companies">
                      <Button variant="ghost">Companies</Button>
                    </Link>
                  </>
                )}

                {user.role === "admin" && ENABLE_ADMIN_FEATURES && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center">
                        Admin <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {adminLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link href={link.href}>
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Link href="/profile">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.profile_picture || ""} alt={user.first_name} />
                    <AvatarFallback>
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button onClick={logout} variant="outline">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )
          ) : (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
