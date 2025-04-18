"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { jobsApi } from "@/lib/api/jobs"
import { useToast } from "@/components/ui/use-toast"
import RoleGuard from "@/components/role-guard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

type Job = {
  id: string
  title: string
  description: string
  skills_required: string[]
  status: "approved" | "pending" | "rejected"
  created_at: string
  updated_at: string
  company?: {
    id: string
    name: string
  }
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        const response = await jobsApi.getAllJobs(currentPage, 10)
        setJobs(response.results)
        setTotalPages(Math.ceil(response.pagination.count / 10))
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [currentPage, toast])

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills_required.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.company?.name && job.company.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      try {
        await jobsApi.deleteJob(jobId)
        setJobs(jobs.filter(job => job.id !== jobId))
        toast({
          title: "Success",
          description: "Job has been deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting job:", error)
        toast({
          title: "Error",
          description: "Failed to delete job. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleApproveJob = async (jobId: string) => {
    try {
      await jobsApi.approveJob(jobId)
      

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: "approved" as const } : job
      ))
      
      toast({
        title: "Success",
        description: "Job has been approved successfully",
      })
    } catch (error) {
      console.error("Error approving job:", error)
      toast({
        title: "Error",
        description: "Failed to approve job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
            {status}
          </Badge>
        )
    }
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="rounded-full p-2 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manage Jobs</h1>
        </div>

        <Card className="border-none shadow-sm rounded-xl mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" /> Job Management
              </CardTitle>
              <div className="flex items-center mt-2 md:mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs..."
                    className="pl-10 w-full md:w-[250px] rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.title}
                        </TableCell>
                        <TableCell>{job.company?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                <Link href={`/jobs/${job.id}`}>View Job</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <Link href={`/admin/jobs/${job.id}/edit`}>Edit Job</Link>
                              </DropdownMenuItem>
                              {job.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleApproveJob(job.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Approve Job</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDeleteJob(job.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Job</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No jobs match your search criteria. Try a different search.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
} 