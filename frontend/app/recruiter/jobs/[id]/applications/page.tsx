"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { jobsApi } from "@/lib/api/jobs"
import { ArrowLeft, FileText, CheckCircle, XCircle, Loader2, Pin, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import RoleGuard from "@/components/role-guard"
import { useToast } from "@/components/ui/use-toast"
import { usePagination } from "@/lib/hooks/use-pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type JobApplication = {
  id: string
  applicant_email: string
  resume_title: string
  created_at: string
  is_approved: boolean
  isPinned?: boolean
}

type Job = {
  id: string
  title: string
  description: string
  skills_required: string[]
  created_at: string
  status?: string
  is_approved?: boolean
}

export default function JobApplicationsPage() {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoadingJob, setIsLoadingJob] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pinnedApplications, setPinnedApplications] = useState<string[]>([])
  

  const isMounted = useRef(true)

  const jobDataFetched = useRef(false)


  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params?.id as string || ''

  const {
    data: applications,
    isLoading: isLoadingApplications,
    error,
    page,
    totalPages,
    nextPage,
    prevPage,
    refresh,
  } = usePagination<JobApplication>({
    fetchFunction: (page, pageSize) => jobsApi.getJobApplications(jobId, page, pageSize),
    initialPage: 1,
    initialPageSize: 10,
    autoFetch: !!jobId,
  })


  const applicationsWithPinned = applications.map((app) => ({
    ...app,
    isPinned: pinnedApplications.includes(app.id),
  }))


  const sortedApplications = [...applicationsWithPinned].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })


  useEffect(() => {
    return () => {
      isMounted.current = false;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchJobDetails = async () => {

      if (jobDataFetched.current || !jobId || jobId === '') {

        if (isLoadingJob && isMounted.current) {
          setIsLoadingJob(false);
        }
        return;
      }
      
      try {
        setIsLoadingJob(true);
        const data = await jobsApi.getJobById(jobId);
        

        if (isMounted.current) {
          setJob(data);
          jobDataFetched.current = true;
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
        

        if (isMounted.current) {
          toast({
            title: "Error",
            description: "Failed to load job details",
            variant: "destructive",
          });
        }
      } finally {

        if (isMounted.current) {
          setIsLoadingJob(false);
        }
      }
    };

    fetchJobDetails();
    

    return () => {

    };
  }, [jobId, toast, isLoadingJob]);

  useEffect(() => {
    if (error && isMounted.current) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch applications",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handlePinApplication = (applicationId: string) => {
    if (pinnedApplications.includes(applicationId)) {
      setPinnedApplications(pinnedApplications.filter((id) => id !== applicationId))
      if (isMounted.current) {
        toast({
          title: "Application unpinned",
          description: "The application has been removed from your pinned list",
        })
      }
    } else {
      setPinnedApplications([...pinnedApplications, applicationId])
      if (isMounted.current) {
        toast({
          title: "Application pinned",
          description: "The application has been added to your pinned list",
        })
      }
    }
  }


  const debouncedRefresh = () => {

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      if (isMounted.current) {
        refresh();
      }
    }, 300);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication || !isMounted.current) return

    try {
      setIsProcessing(true)
      await jobsApi.approveApplication(selectedApplication.id)
      
      if (isMounted.current) {
        toast({
          title: "Success",
          description: "Application approved successfully",
        })
        setSelectedApplication(null)
        setActionType(null)
        debouncedRefresh()
      }
    } catch (error) {
      console.error("Failed to approve application:", error)
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to approve application",
          variant: "destructive",
        })
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false)
      }
    }
  }

  const handleRejectApplication = async () => {
    if (!selectedApplication || !isMounted.current) return

    try {
      setIsProcessing(true)
      await jobsApi.rejectApplication(selectedApplication.id)
      
      if (isMounted.current) {
        toast({
          title: "Success",
          description: "Application rejected successfully",
        })
        setSelectedApplication(null)
        setActionType(null)
        debouncedRefresh()
      }
    } catch (error) {
      console.error("Failed to reject application:", error)
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to reject application",
          variant: "destructive",
        })
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false)
      }
    }
  }

  const isLoading = isLoadingJob || isLoadingApplications

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="rounded-full p-2 mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Job Not Found</h1>
        </div>
        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Job Not Found</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/recruiter/jobs">
              <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={["recruiter", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="rounded-full p-2 mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Applications for {job.title}</h1>
            <p className="text-gray-500">Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card className="border-none shadow-sm rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                This job posting hasn't received any applications yet.
              </p>
              <Link href="/recruiter/jobs">
                <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">Back to Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6">
              {sortedApplications.map((application) => (
                <Card
                  key={application.id}
                  className={`border-none shadow-sm rounded-xl overflow-hidden ${
                    application.isPinned ? "border-l-4 border-l-[#0071e3]" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {application.resume_title}
                          {application.isPinned && <Pin className="h-4 w-4 ml-2 text-[#0071e3] fill-[#0071e3]" />}
                        </CardTitle>
                        <CardDescription>
                          {application.applicant_email} • Applied{" "}
                          {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            application.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          } mr-2`}
                        >
                          {application.is_approved ? "Approved" : "Pending Review"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <FileText className="mr-2 h-4 w-4" /> View Resume
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Download className="mr-2 h-4 w-4" /> Download Resume
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg ${application.isPinned ? "text-[#0071e3] bg-blue-50" : ""}`}
                        onClick={() => handlePinApplication(application.id)}
                      >
                        <Pin className="mr-2 h-4 w-4" /> {application.isPinned ? "Unpin" : "Pin"}
                      </Button>
                      {!application.is_approved && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setSelectedApplication(application)
                              setActionType("approve")
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedApplication(application)
                              setActionType("reject")
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button variant="outline" onClick={prevPage} disabled={page === 1} className="rounded-lg">
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" onClick={nextPage} disabled={page === totalPages} className="rounded-lg">
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={!!selectedApplication && actionType === "approve"}
        onOpenChange={(open) => !open && setSelectedApplication(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this application? This will notify the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{selectedApplication?.resume_title}</p>
            <p className="text-sm text-gray-500 mt-1">{selectedApplication?.applicant_email}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleApproveApplication}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Approve Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedApplication && actionType === "reject"}
        onOpenChange={(open) => !open && setSelectedApplication(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{selectedApplication?.resume_title}</p>
            <p className="text-sm text-gray-500 mt-1">{selectedApplication?.applicant_email}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectApplication}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  )
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <Button variant="link" className="p-0" onClick={() => router.push(href)}>
      {children}
    </Button>
  )
}
