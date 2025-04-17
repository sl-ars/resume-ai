"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { jobsApi } from "@/lib/api/jobs"
import { resumesApi } from "@/lib/api/resumes"
import { ArrowLeft, Briefcase, FileText, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


type JobForApply = {
  id: string
  title: string
  description: string
  skills_required: string[]
  created_at: string
  location: string | null
  is_remote: boolean
  status: string
  company?: {
    id: string
    name: string
    description: string
    website: string
    logo: string | null
  }
}


type ResumeForApply = {
  id: string
  title: string
  created_at: string
  status: "pending" | "processing" | "completed" | "failed"
  visibility: "private" | "public"
}

export default function ApplyJobPage() {
  const [job, setJob] = useState<JobForApply | null>(null)
  const [resumes, setResumes] = useState<ResumeForApply[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [isLoadingJob, setIsLoadingJob] = useState(true)
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params?.id

  useEffect(() => {
    
    if (!jobId) return

    
    let isMounted = true

    const fetchJobDetails = async () => {
      try {
        setIsLoadingJob(true)
        const jobData = await jobsApi.getJobById(jobId)
        
        if (isMounted) {
          setJob(jobData)
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err)
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load job details",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoadingJob(false)
        }
      }
    }

    const fetchResumes = async () => {
      try {
        setIsLoadingResumes(true)
        const { results } = await resumesApi.getAll(1, 100)
        
        
        const availableResumes = results.filter(resume => resume.status === "completed")
        
        
        if (isMounted) {
          setResumes(availableResumes as ResumeForApply[])

          
          if (availableResumes.length > 0) {
            setSelectedResumeId(availableResumes[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err)
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load your resumes",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoadingResumes(false)
        }
      }
    }

    fetchJobDetails()
    fetchResumes()

    
    return () => {
      isMounted = false
    }
  }, [jobId]) 

  const handleApply = async () => {
    if (!selectedResumeId || !jobId) {
      toast({
        title: "Error",
        description: "Please select a resume to apply with",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await jobsApi.applyToJob(jobId, selectedResumeId)
      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to submit application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isLoadingJob || isLoadingResumes

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
            <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Job Not Found</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg" onClick={() => router.push("/jobs")}>
              Browse All Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="rounded-full p-2 mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="border-none shadow-sm rounded-xl mb-6">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {job.company && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Company</h3>
                    <p className="text-gray-700">{job.company.name}</p>
                    {job.company.description && (
                      <p className="text-gray-600 mt-2">{job.company.description}</p>
                    )}
                    {job.company.website && (
                      <p className="text-blue-600 mt-2">
                        <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit Company Website
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="border-none shadow-sm rounded-xl sticky top-20">
              <CardHeader>
                <CardTitle>Submit Your Application</CardTitle>
                <CardDescription>Select a resume to apply with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumes.length === 0 ? (
                  <div className="text-center py-4">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 mb-4">You don't have any analyzed resumes yet.</p>
                    <Button
                      className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg"
                      onClick={() => router.push("/upload")}
                    >
                      Upload Resume
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="resume" className="text-sm font-medium">
                        Select Resume
                      </label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger id="resume">
                          <SelectValue placeholder="Select a resume" />
                        </SelectTrigger>
                        <SelectContent>
                          {resumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg"
                      onClick={handleApply}
                      disabled={isSubmitting || !selectedResumeId}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </>
                )}
                <p className="text-xs text-gray-400 text-center">
                  By applying, you agree to share your resume information with the employer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
