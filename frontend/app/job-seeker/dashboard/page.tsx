"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Briefcase, FileSearch } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import RoleGuard from "@/components/role-guard"
import { useToast } from "@/components/ui/use-toast"
import { usePagination } from "@/lib/hooks/use-pagination"
import { resumesApi } from "@/lib/api/resumes"
import { useEffect } from "react"

type Resume = {
  id: string
  title: string
  created_at: string
  status: "uploaded" | "parsed" | "analyzed"
  visibility: "private" | "public"
}

export default function JobSeekerDashboardPage() {
  const { toast } = useToast()

  const {
    data: resumes,
    isLoading,
    error,
    page,
    totalPages,
    nextPage,
    prevPage,
    refresh,
  } = usePagination<Resume>({
    fetchFunction: resumesApi.getAll,
    initialPage: 1,
    initialPageSize: 10,
  })

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch resumes",
        variant: "destructive",
      })
    }
  }, [error, toast])

  return (
    <RoleGuard allowedRoles={["job_seeker"]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Job Seeker Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Resumes</CardTitle>
              <CardDescription>Manage your uploaded resumes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{resumes.length}</div>
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-lg">
                    <FileText className="mr-2 h-4 w-4" /> View All
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Job Matches</CardTitle>
              <CardDescription>Jobs matching your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">12</div>
                <Link href="/job-seeker/job-matches">
                  <Button variant="outline" className="rounded-lg">
                    <Briefcase className="mr-2 h-4 w-4" /> View Matches
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Applications</CardTitle>
              <CardDescription>Track your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">5</div>
                <Link href="/job-seeker/applications">
                  <Button variant="outline" className="rounded-lg">
                    <FileSearch className="mr-2 h-4 w-4" /> View Applications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Resumes</h2>
          <Link href="/upload">
            <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
              <Plus className="mr-2 h-4 w-4" /> Upload Resume
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.slice(0, 3).map((resume) => (
            <Card key={resume.id} className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{resume.title}</CardTitle>
                <CardDescription>
                  Uploaded {formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Link href={`/resume/${resume.id}/content`}>
                  <Button variant="outline" className="w-full rounded-lg">
                    <FileText className="mr-2 h-4 w-4" /> View Content
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {resumes.length > 3 && (
          <div className="text-center mt-6">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-lg">
                View All Resumes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
