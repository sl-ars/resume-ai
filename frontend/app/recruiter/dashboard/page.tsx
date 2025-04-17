"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Briefcase, 
  Users, 
  Building, 
  Plus, 
  FileSearch, 
  Loader2 
} from "lucide-react"
import Link from "next/link"
import RoleGuard from "@/components/role-guard"
import { useToast } from "@/components/ui/use-toast"
import { usePagination } from "@/lib/hooks/use-pagination"
import { jobsApi } from "@/lib/api/jobs"
import { companiesApi } from "@/lib/api/companies"
import { applicationsApi } from "@/lib/api/applications"

type Job = {
  id: string
  title: string
  description: string
  skills_required: string[]
  created_at: string
  status: string
}

type Company = {
  id: string
  name: string
  description: string
  website: string
  logo: string
}

export default function RecruiterDashboardPage() {
  const { toast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null)
  const [applicationsLoading, setApplicationsLoading] = useState(true)

  const {
    data: jobs,
    isLoading: jobsLoading,
    error: jobsError,
    refresh: refreshJobs,
  } = usePagination<Job>({
    fetchFunction: async (page, pageSize) => {
      try {
        return await jobsApi.getAllJobs(page, pageSize)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        return { results: [], pagination: { count: 0, next: null, previous: null } }
      }
    },
    initialPage: 1,
    initialPageSize: 10,
    autoFetch: false
  })


  useEffect(() => {
    let isMounted = true;
    
    async function fetchCompanyData() {
      if (!isMounted) return;
      
      try {
        setCompanyLoading(true)
        setCompanyError(null)
        const companyData = await companiesApi.getCurrentUserCompany()
        
        if (isMounted) {
          setCompany(companyData)
          refreshJobs();
        }
      } catch (err) {
        console.error("Failed to fetch company data:", err)
        if (isMounted) {
          setCompanyError("No company found. You may need to set up your company profile.")
          setCompany(null)
          refreshJobs();
        }
      } finally {
        if (isMounted) {
          setCompanyLoading(false)
        }
      }
    }

    fetchCompanyData()
    
    return () => {
      isMounted = false;
    };
  }, [refreshJobs])


  useEffect(() => {
    let isMounted = true;
    
    async function fetchApplicationsCount() {
      if (!isMounted) return;
      
      try {
        setApplicationsLoading(true)
        const result = await applicationsApi.getAllApplications(1, 1)
        if (isMounted) {
          setApplicationsCount(result.pagination.count)
        }
      } catch (err) {
        console.error("Failed to fetch applications count:", err)
        if (isMounted) {
          setApplicationsCount(0)
        }
      } finally {
        if (isMounted) {
          setApplicationsLoading(false)
        }
      }
    }

    fetchApplicationsCount()
    
    return () => {
      isMounted = false;
    };
  }, [])

  useEffect(() => {
    if (jobsError) {
      toast({
        title: "Error",
        description: jobsError.message || "Failed to fetch job listings",
        variant: "destructive",
      })
    }
  }, [jobsError, toast])

  return (
    <RoleGuard allowedRoles={["recruiter", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Employer Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Company</CardTitle>
              <CardDescription>Manage your company information</CardDescription>
            </CardHeader>
            <CardContent>
              {companyLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0071e3]" />
                </div>
              ) : company ? (
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg truncate">{company.name}</div>
                  <Link href="/recruiter/company">
                    <Button variant="outline" className="rounded-lg">
                      <Building className="mr-2 h-4 w-4" /> Manage
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-red-500">{companyError}</p>
                  <Link href="/recruiter/company">
                    <Button variant="outline" className="w-full rounded-lg">
                      <Building className="mr-2 h-4 w-4" /> Create Company
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Job Listings</CardTitle>
              <CardDescription>Manage your job postings</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0071e3]" />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold">{jobs.length}</div>
                  <Link href="/recruiter/jobs">
                    <Button variant="outline" className="rounded-lg">
                      <Briefcase className="mr-2 h-4 w-4" /> View All
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Applicants</CardTitle>
              <CardDescription>Review job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0071e3]" />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold">{applicationsCount || 0}</div>
                  <Link href="/recruiter/applicants">
                    <Button variant="outline" className="rounded-lg">
                      <Users className="mr-2 h-4 w-4" /> View Applicants
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Job Listings</h2>
          <Link href="/recruiter/jobs/create">
            <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
              <Plus className="mr-2 h-4 w-4" /> Post New Job
            </Button>
          </Link>
        </div>

        {jobsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No job listings yet</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Create your first job posting to start receiving applications.
              </p>
              <Link href="/recruiter/jobs/create">
                <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
                  <Plus className="mr-2 h-4 w-4" /> Post New Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.slice(0, 2).map((job) => (
              <Card key={job.id} className="border-none shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>Posted recently • Applications pending</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Skills:</span>
                      <span className="text-right">{job.skills_required.slice(0, 3).join(", ")}{job.skills_required.length > 3 ? "..." : ""}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 ${job.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} rounded-full text-xs`}>
                        {job.status === "approved" ? "Approved" : "Pending Approval"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <FileSearch className="mr-2 h-4 w-4" /> View Applicants
                    </Button>
                    <Link href={`/recruiter/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {jobs.length > 2 && (
          <div className="text-center mt-6">
            <Link href="/recruiter/jobs">
              <Button variant="outline" className="rounded-lg">
                View All Job Listings
              </Button>
            </Link>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
