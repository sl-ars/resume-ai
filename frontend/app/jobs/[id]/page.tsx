"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { jobsApi } from "@/lib/api/jobs"
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Bookmark,
  CheckCircle,
  DollarSign as DollarSignIcon,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"


type JobResponse = {
  id: string
  title: string
  description: string
  skills_required: string[]
  created_at: string
  updated_at: string
  location?: string | null
  is_remote?: boolean
  status?: string
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


type Job = {
  id: string
  title: string
  description: string
  skills_required: string[]
  created_at: string
  is_approved: boolean
  created_by: {
    id: number
    email: string
    name: string
  }
  location?: string | null
  job_type?: string
  company_name?: string
  company_description?: string
  company_website?: string
  company_logo?: string | null
  salary_range?: string
}

export default function JobDetailPage() {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params?.id

  
  const isMounted = useRef(true)

  useEffect(() => {
    
    isMounted.current = true
    
    
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    
    if (!jobId) return
    
    let isActive = true
    
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true)
        const jobData = await jobsApi.getJobById(jobId)
        
        
        if (isMounted.current && isActive) {
          
          const formattedJob: Job = {
            id: jobData.id,
            title: jobData.title,
            description: jobData.description,
            skills_required: jobData.skills_required,
            created_at: jobData.created_at,
            is_approved: jobData.status === "approved",
            created_by: {
              id: 0,
              email: "",
              name: ""
            },
            location: jobData.location || null,
            job_type: jobData.is_remote ? "Remote" : "On-site",
            company_name: jobData.company?.name || "Unknown Company",
            company_description: jobData.company?.description || "",
            company_website: jobData.company?.website || "",
            company_logo: jobData.company?.logo || null
          }
          
          setJob(formattedJob)
          setError(null)
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err)
        
        if (isMounted.current && isActive) {
          setError("Failed to load job details. Please try again.")
          toast({
            title: "Error",
            description: "Failed to load job details",
            variant: "destructive",
          })
        }
      } finally {
        
        if (isMounted.current && isActive) {
          setIsLoading(false)
        }
      }
    }

    fetchJobDetails()
    
    
    return () => {
      isActive = false
    }
  }, [jobId]) 

  const handleSaveJob = () => {
    setIsSaved(!isSaved)
    toast({
      title: isSaved ? "Job removed from saved jobs" : "Job saved successfully",
      description: isSaved ? "You can add it back anytime" : "You can view it in your saved jobs",
    })
  }

  const handleShareJob = () => {
    if (navigator.share) {
      navigator
        .share({
          title: job?.title,
          text: `Check out this job: ${job?.title} at ${job?.company_name}`,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied to clipboard",
        description: "You can now share it with others",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error || !job) {
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
            <Link href="/jobs">
              <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">Browse All Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="rounded-full p-2 mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{job.title}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-none shadow-sm rounded-xl mb-6">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    {job.company_name || "Company Name"}
                  </CardDescription>
                </div>
                <div className="flex items-center mt-2 md:mt-0 space-x-2">
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={handleSaveJob}>
                    {isSaved ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <Bookmark className="h-4 w-4 mr-2" />
                    )}
                    {isSaved ? "Saved" : "Save Job"}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={handleShareJob}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center mr-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location === null ? "Remote" : job.location}</span>
                </div>
                <div className="flex items-center mr-4">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{job.job_type || "Full-time"}</span>
                </div>
                <div className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center">
                    <DollarSignIcon className="h-4 w-4 mr-1" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                  <div className="whitespace-pre-line text-gray-700">{job.description}</div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">About {job.company_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {job.company_description || `${job.company_name} is a leading organization in its field, committed to innovation and excellence. With a strong focus on employee growth and development, they offer a collaborative and inclusive work environment.`}
              </p>
              {job.company_website && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Building className="h-4 w-4 mr-1" />
                  <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Visit company website
                  </a>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Building className="h-4 w-4 mr-1" />
                <span>Company Size: 50-200 employees</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="border-none shadow-sm rounded-xl sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Apply for this job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Submit your application now to be considered for this position. Make sure your resume is up to date.
              </p>
              <Link href={`/jobs/${job.id}/apply`}>
                <Button className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">Apply Now</Button>
              </Link>
              <p className="text-xs text-gray-400 text-center">Application takes less than 5 minutes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DollarSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
