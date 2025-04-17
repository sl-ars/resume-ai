"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { jobsApi } from "@/lib/api/jobs"
import { Briefcase, Plus, Search, FileSearch, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
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
}

export default function RecruiterJobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const {
    data: jobs,
    isLoading,
    error,
    page,
    totalPages,
    nextPage,
    prevPage,
    refresh,
  } = usePagination<Job>({
    fetchFunction: jobsApi.getAllJobs,
    initialPage: 1,
    initialPageSize: 10,
  })

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch job listings",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills_required.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleDeleteJob = async () => {
    if (!jobToDelete) return

    try {
      setIsDeleting(true)
      await jobsApi.deleteJob(jobToDelete.id)
      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      })
      setJobToDelete(null)
      refresh()
    } catch (error) {
      console.error("Failed to delete job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete job posting",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <RoleGuard allowedRoles={["recruiter", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Job Listings</h1>
            <p className="text-gray-500">Manage your job postings and view applications</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                className="pl-10 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/recruiter/jobs/create">
              <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Post New Job
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No job listings yet</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                {searchQuery
                  ? "No jobs match your search criteria. Try a different search term."
                  : "Create your first job posting to start receiving applications."}
              </p>
              {!searchQuery && (
                <Link href="/recruiter/jobs/create">
                  <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
                    <Plus className="mr-2 h-4 w-4" /> Post New Job
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription>
                          Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            job.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          } mr-2`}
                        >
                          {job.is_approved ? "Approved" : "Pending Approval"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills_required.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/recruiter/jobs/${job.id}/applications`}>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <FileSearch className="mr-2 h-4 w-4" /> View Applications
                        </Button>
                      </Link>
                      <Link href={`/recruiter/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setJobToDelete(job)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
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

      <Dialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{jobToDelete?.title}</p>
            <p className="text-sm text-gray-500 mt-1">
              Posted {jobToDelete && formatDistanceToNow(new Date(jobToDelete.created_at), { addSuffix: true })}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteJob}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  )
}
