"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { resumesApi } from "@/lib/api/resumes"
import { jobsApi } from "@/lib/api/jobs"
import { 
  FileText, 
  Plus, 
  FileScanIcon as FileAnalytics, 
  Loader2,
  Briefcase,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Users
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/components/ui/use-toast"
import { usePagination } from "@/lib/hooks/use-pagination"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-provider"


type Resume = {
  id: string
  title: string
  created_at: string
  status: "uploaded" | "parsed" | "analyzed"
  visibility: "private" | "public"
}


type JobApplication = {
  id: string
  applicant_email: string
  resume_title: string
  job: {
    id: string
    title: string
    description: string
    skills_required: string[]
    location: string | null
    is_remote: boolean
    status: "approved" | "pending" | "rejected"
    created_at: string
    updated_at: string
    company?: {
      id: string
      name: string
      description: string
      website: string
      logo: string | null
      created_at: string
      updated_at: string
    }
  }
  is_approved: boolean
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState(user?.role === "job_seeker" ? "resumes" : "jobs")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  
  
  const {
    data: resumes,
    isLoading: isLoadingResumes,
    error: resumesError,
    page: resumesPage,
    totalPages: resumesTotalPages,
    nextPage: resumesNextPage,
    prevPage: resumesPrevPage,
    refresh: refreshResumes,
  } = usePagination<Resume>({
    fetchFunction: resumesApi.getAll as any, 
    initialPage: 1,
    initialPageSize: 10,
  })
  
  
  const {
    data: applications,
    isLoading: isLoadingApplications,
    error: applicationsError,
    page: applicationsPage,
    totalPages: applicationsTotalPages,
    nextPage: applicationsNextPage,
    prevPage: applicationsPrevPage,
    refresh: refreshApplications,
  } = usePagination<JobApplication>({
    fetchFunction: jobsApi.getUserApplications,
    initialPage: 1,
    initialPageSize: 10,
  })

  useEffect(() => {
    if (resumesError) {
      toast({
        title: "Error",
        description: resumesError.message || "Failed to fetch resumes",
        variant: "destructive",
      })
    }
    
    if (applicationsError) {
      toast({
        title: "Error",
        description: applicationsError.message || "Failed to fetch applications",
        variant: "destructive",
      })
    }
  }, [resumesError, applicationsError, toast])

  const handleParseResume = async (resumeId: string) => {
    try {
      await resumesApi.parseResume(resumeId)
      toast({
        title: "Success",
        description: "Resume parsing started",
      })
      refreshResumes()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse resume",
        variant: "destructive",
      })
    }
  }

  const handleAnalyzeResume = async (resumeId: string) => {
    try {
      await resumesApi.analyzeResume(resumeId)
      toast({
        title: "Success",
        description: "Resume analysis started",
      })
      refreshResumes()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive",
      })
    }
  }
  
  const handleDeleteApplication = async () => {
    if (!selectedApplicationId) return
    
    try {
      await jobsApi.withdrawApplication(selectedApplicationId)
      
      toast({
        title: "Success",
        description: "Application withdrawn successfully",
      })
      refreshApplications()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error withdrawing application:", error)
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive",
      })
    }
  }
  
  const openDeleteDialog = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setDeleteDialogOpen(true)
  }

  const getResumeStatusBadge = (status: string) => {
    switch (status) {
      case "uploaded":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Uploaded</span>
      case "parsed":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Parsed</span>
      case "analyzed":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Analyzed</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }
  
  const getApplicationStatusBadge = (jobStatus: string, isApproved: boolean) => {
    if (!isApproved && jobStatus === "approved") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      )
    }
    
    switch (jobStatus) {
      case "approved":
        return isApproved ? (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
            {jobStatus}
          </Badge>
        )
    }
  }

  const isLoading = isLoadingResumes || isLoadingApplications

  
  const renderJobSeekerDashboard = () => (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
      <div className="flex justify-between items-center mb-8">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="resumes" className="rounded-lg">
            <FileText className="mr-2 h-4 w-4" /> Resumes
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-lg">
            <Briefcase className="mr-2 h-4 w-4" /> Applications
          </TabsTrigger>
        </TabsList>
        
        {activeTab === "resumes" && (
          <Link href="/upload">
            <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
              <Plus className="mr-2 h-4 w-4" /> Upload Resume
            </Button>
          </Link>
        )}
        
        {activeTab === "applications" && (
          <Link href="/jobs">
            <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
              <Plus className="mr-2 h-4 w-4" /> Browse Jobs
            </Button>
          </Link>
        )}
      </div>
      
      <TabsContent value="resumes">
        {isLoadingResumes ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          </div>
        ) : resumes.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No resumes yet</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Upload your first resume to get started with AI-powered analysis and optimization.
              </p>
              <Link href="/upload">
                <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
                  <Plus className="mr-2 h-4 w-4" /> Upload Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{resume.title}</CardTitle>
                      {getResumeStatusBadge(resume.status)}
                    </div>
                    <CardDescription>
                      Uploaded {formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/resume/${resume.id}/content`}>
                      <Button variant="outline" className="rounded-lg">
                        <FileText className="mr-2 h-4 w-4" /> View Content
                      </Button>
                    </Link>
                    {resume.status === "uploaded" ? (
                      <Button
                        className="rounded-lg bg-[#0071e3] hover:bg-[#0077ED]"
                        onClick={() => handleParseResume(resume.id)}
                      >
                        Parse Resume
                      </Button>
                    ) : resume.status === "parsed" ? (
                      <Button
                        className="rounded-lg bg-[#0071e3] hover:bg-[#0077ED]"
                        onClick={() => handleAnalyzeResume(resume.id)}
                      >
                        <FileAnalytics className="mr-2 h-4 w-4" /> Analyze
                      </Button>
                    ) : (
                      <Link href={`/resume/${resume.id}/analysis`}>
                        <Button className="rounded-lg bg-[#0071e3] hover:bg-[#0077ED]">
                          <FileAnalytics className="mr-2 h-4 w-4" /> View Analysis
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {resumesTotalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button variant="outline" onClick={resumesPrevPage} disabled={resumesPage === 1} className="rounded-lg">
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {resumesPage} of {resumesTotalPages}
                </span>
                <Button variant="outline" onClick={resumesNextPage} disabled={resumesPage === resumesTotalPages} className="rounded-lg">
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>
      
      <TabsContent value="applications">
        {isLoadingApplications ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Browse available jobs and submit your application to get started.
              </p>
              <Link href="/jobs">
                <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
                  <Briefcase className="mr-2 h-4 w-4" /> Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map((application) => (
                <Card key={application.id} className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{application.job.title}</CardTitle>
                      {getApplicationStatusBadge(application.job.status, application.is_approved)}
                    </div>
                    <CardDescription>
                      <div className="flex flex-col space-y-1">
                        <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                        <span>Company: {application.job.company?.name || "Not specified"}</span>
                        <span>Resume: {application.resume_title}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {application.job.status === "rejected" && (
                      <div className="p-3 bg-red-50 rounded-lg mb-3">
                        <p className="text-sm font-medium text-red-800 mb-1">Job Status:</p>
                        <p className="text-sm text-red-700">This job posting has been rejected or removed.</p>
                      </div>
                    )}
                    
                    {application.is_approved && (
                      <div className="p-3 bg-green-50 rounded-lg mb-3">
                        <p className="text-sm text-green-700">
                          Congratulations! Your application has been approved. You should hear from the employer soon.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/jobs/${application.job.id}`}>
                      <Button variant="outline" className="rounded-lg">
                        <Eye className="mr-2 h-4 w-4" /> View Job
                      </Button>
                    </Link>
                    
                    {!application.is_approved && (
                      <Button 
                        variant="destructive" 
                        className="rounded-lg"
                        onClick={() => openDeleteDialog(application.id)}
                      >
                        <X className="mr-2 h-4 w-4" /> Withdraw
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {applicationsTotalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button variant="outline" onClick={applicationsPrevPage} disabled={applicationsPage === 1} className="rounded-lg">
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {applicationsPage} of {applicationsTotalPages}
                </span>
                <Button variant="outline" onClick={applicationsNextPage} disabled={applicationsPage === applicationsTotalPages} className="rounded-lg">
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );

  
  const renderRecruiterDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/recruiter/jobs/create">
            <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
              <Plus className="mr-2 h-4 w-4" /> Post Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/recruiter/company">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" /> Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Manage your company information and settings</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recruiter/jobs">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" /> Job Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Manage your job postings and view applications</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recruiter/applicants">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" /> Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">View and manage job applications</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );

  
  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" /> Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Manage users and permissions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/jobs">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" /> Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Approve and manage job listings</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/companies">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" /> Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Manage company profiles</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        {user?.role === "job_seeker" && renderJobSeekerDashboard()}
        {user?.role === "recruiter" && renderRecruiterDashboard()}
        {user?.role === "admin" && renderAdminDashboard()}
        
        {/* Delete application confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Withdraw Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to withdraw this application? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteApplication}>
                Withdraw Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
