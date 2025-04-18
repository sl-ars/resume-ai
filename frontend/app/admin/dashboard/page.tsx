"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Briefcase, BarChart, Settings, Shield, Building, Loader2 } from "lucide-react"
import Link from "next/link"
import RoleGuard from "@/components/role-guard"
import { useToast } from "@/components/ui/use-toast"
import { resumesApi } from "@/lib/api/resumes"
import { jobsApi } from "@/lib/api/jobs"
import { usersApi } from "@/lib/api/users"

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalJobs: 0,
    totalCompanies: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        const [usersResponse, resumesResponse, jobsResponse] = await Promise.all([
          usersApi.getAllUsers(1, 1),
          resumesApi.getAll(1, 1),
          jobsApi.getAllJobs(1, 1)
        ])
        
        setStats({
          totalUsers: usersResponse.pagination.count,
          totalResumes: resumesResponse.pagination.count,
          totalJobs: jobsResponse.pagination.count,
          totalCompanies: 0
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Users</CardTitle>
                  <CardDescription>All registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                    <Link href="/admin/users">
                      <Button variant="outline" className="rounded-lg">
                        <Users className="mr-2 h-4 w-4" /> Manage Users
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Resumes</CardTitle>
                  <CardDescription>All uploaded resumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{stats.totalResumes.toLocaleString()}</div>
                    <Link href="/admin/resumes">
                      <Button variant="outline" className="rounded-lg">
                        <FileText className="mr-2 h-4 w-4" /> View All
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Job Listings</CardTitle>
                  <CardDescription>All posted jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{stats.totalJobs.toLocaleString()}</div>
                    <Link href="/admin/jobs">
                      <Button variant="outline" className="rounded-lg">
                        <Briefcase className="mr-2 h-4 w-4" /> View All
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Companies</CardTitle>
                  <CardDescription>All registered companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{stats.totalCompanies.toLocaleString()}</div>
                    <Link href="/admin/companies">
                      <Button variant="outline" className="rounded-lg">
                        <Building className="mr-2 h-4 w-4" /> View All
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" /> System Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Users</span>
                        <span className="font-medium">{stats.totalUsers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0071e3] h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Resumes</span>
                        <span className="font-medium">{stats.totalResumes}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0071e3] h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Jobs</span>
                        <span className="font-medium">{stats.totalJobs}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0071e3] h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <Link href="/admin/analytics">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        View Detailed Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" /> Admin Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/users">
                      <Button variant="outline" className="w-full justify-start rounded-lg">
                        <Users className="mr-2 h-4 w-4" /> Manage Users
                      </Button>
                    </Link>
                    <Link href="/admin/jobs">
                      <Button variant="outline" className="w-full justify-start rounded-lg">
                        <Briefcase className="mr-2 h-4 w-4" /> Manage Jobs
                      </Button>
                    </Link>
                    <Link href="/admin/companies">
                      <Button variant="outline" className="w-full justify-start rounded-lg">
                        <Building className="mr-2 h-4 w-4" /> Manage Companies
                      </Button>
                    </Link>
                    <Link href="/admin/settings">
                      <Button variant="outline" className="w-full justify-start rounded-lg">
                        <Settings className="mr-2 h-4 w-4" /> System Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  )
}
