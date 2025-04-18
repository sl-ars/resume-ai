"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { jobsApi } from "@/lib/api/jobs"
import { Briefcase, Search, Filter, MapPin, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { usePagination } from "@/lib/hooks/use-pagination"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Job = {
  id: string
  user: number
  title: string
  description: string
  skills_required: string[]
  status: "approved" | "pending" | "rejected"
  created_at: string
  updated_at: string
}

export default function JobsPage() {
  const { toast } = useToast()
  
  
  const [searchQuery, setSearchQuery] = useState("")
  const [skillFilter, setSkillFilter] = useState("all")
  
  
  const isFirstRender = useRef(true)
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  
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
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    
    debounceTimerRef.current = setTimeout(() => {
      refresh();
    }, 300);
    
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, skillFilter, refresh]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch job listings",
        variant: "destructive",
      })
    }
  }, [error, toast])

  
  const approvedJobs = useMemo(() => {
    return jobs.filter((job) => job.status === "approved")
  }, [jobs])

  
  const filteredJobs = useMemo(() => {
    return approvedJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSkill =
        skillFilter === "all" || job.skills_required.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()))

      return matchesSearch && matchesSkill
    })
  }, [approvedJobs, searchQuery, skillFilter])

  
  const allSkills = useMemo(() => {
    return Array.from(new Set(approvedJobs.flatMap((job) => job.skills_required))).sort()
  }, [approvedJobs])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Listings</h1>
          <p className="text-gray-500">Find your next opportunity</p>
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
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by skill" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {allSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No job listings found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {searchQuery || skillFilter !== "all"
                ? "No jobs match your search criteria. Try different search terms or filters."
                : "There are no job listings available at the moment. Please check back later."}
            </p>
            {(searchQuery || skillFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSkillFilter("all")
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
  )
}
