"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { jobsApi } from "@/lib/api/jobs"
import { Building, Search, Briefcase, Clock, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

type JobBasic = {
  id: string
  title: string
  description: string
  skills_required: string[]
  status: string
  created_at: string
  updated_at: string
  company?: {
    id: string
    name: string
    description: string
    website: string
    logo: string | null
  }
  company_id?: string
}

type Company = {
  id: string
  name: string
  description: string
  website: string
  logo: string | null
  jobs: Job[]
}

type Job = {
  id: string
  title: string
  description: string
  skills_required: string[]
  status: string
  created_at: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const isMounted = useRef(false)

  useEffect(() => {

    if (isMounted.current) return;
    isMounted.current = true;
    
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        

        const jobsBasicResponse = await jobsApi.getAllJobs(1, 100)
        const approvedJobs = jobsBasicResponse.results.filter(job => job.status === "approved") as JobBasic[]
        


        const companiesMap = new Map<string, Company>()
        

        approvedJobs.forEach(job => {
          if (job.company) {
            const companyId = job.company.id || job.company_id
            if (companyId && !companiesMap.has(companyId)) {
              companiesMap.set(companyId, {
                id: companyId,
                name: job.company.name || "Unknown Company",
                description: job.company.description || "",
                website: job.company.website || "",
                logo: job.company.logo || null,
                jobs: []
              })
            }
          }
        })
        

        approvedJobs.forEach(job => {
          if (job.company) {
            const companyId = job.company.id || job.company_id
            if (companyId && companiesMap.has(companyId)) {
              const company = companiesMap.get(companyId)!
              company.jobs.push({
                id: job.id,
                title: job.title,
                description: job.description,
                skills_required: job.skills_required || [],
                status: job.status,
                created_at: job.created_at
              })
            }
          }
        })
        

        const companiesArray = Array.from(companiesMap.values())
        setCompanies(companiesArray)
        setFilteredCompanies(companiesArray)
      } catch (error) {
        console.error("Failed to fetch companies:", error)
        toast({
          title: "Error",
          description: "Failed to load companies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [toast])


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCompanies(companies)
    } else {
      const searchTermLower = searchQuery.toLowerCase()
      const filtered = companies.filter(
        company => 
          company.name.toLowerCase().includes(searchTermLower) || 
          company.description.toLowerCase().includes(searchTermLower) ||
          company.jobs.some(job => 
            job.title.toLowerCase().includes(searchTermLower) ||
            job.description.toLowerCase().includes(searchTermLower) ||
            job.skills_required.some(skill => skill.toLowerCase().includes(searchTermLower))
          )
      )
      setFilteredCompanies(filtered)
    }
  }, [searchQuery, companies])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-gray-500">Find opportunities at top companies</p>
        </div>
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies or jobs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No companies found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {searchQuery
                ? "No companies match your search criteria. Try different search terms."
                : "There are no companies available at the moment. Please check back later."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <Building className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm flex items-center mt-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" /> {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {company.description && (
                  <div className="mb-4">
                    <p className="text-gray-700">{company.description}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Open Positions ({company.jobs.length})</h4>
                  <div className="space-y-3">
                    {company.jobs.map((job) => (
                      <Link key={job.id} href={`/jobs/${job.id}`}>
                        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-gray-900">{job.title}</h5>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {job.skills_required.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="rounded-full">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 