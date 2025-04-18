"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { resumesApi } from "@/lib/api/resumes"
import { ArrowLeft, Loader2, FileText, FileScanIcon as FileAnalytics, Globe, Lock } from "lucide-react"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


type ResumeContent = {
  title: string
  status: "uploaded" | "parsed" | "analyzed"
  visibility: "private" | "public"
  content: {
    full_name: string | null
    email: string | null
    phone: string | null
    location: string | null
    linkedin_url: string | null
    summary: string | null
    raw_text: string | null
    experience?: {
      title: string
      company: string
      start_date: string
      end_date: string | null
      location?: string
      description: string[]
    }[]
    education?: {
      degree: string
      institution: string
      graduation_date: string
      location?: string
      gpa?: string
      description?: string[]
    }[]
    skills?: string[]
    projects?: {
      name: string
      description: string[]
      technologies?: string[]
      url?: string
    }[]
    certifications?: {
      name: string
      issuer?: string
      date?: string
    }[]
  }
  analysis?: {
    overall_score: number
    content_score: number
    formatting_score: number
    ats_compatibility_score: number
    strengths: string[]
    weaknesses: string[]
    improvement_suggestions: string[]
  }
}

export default function ResumeContentPage() {
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [visibility, setVisibility] = useState<"private" | "public">("private")
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const resumeId = params.id as string

  useEffect(() => {
    if (resumeId) {
      fetchResumeContent()
    }
  }, [resumeId])


  const fetchResumeContent = async () => {
    try {
      setIsLoading(true)

      const resumeData = await resumesApi.getById(resumeId)


      const contentData = await resumesApi.getResumeContent(resumeId)


      let analysisData = null
      if (resumeData.status === "analyzed") {
        try {
          analysisData = await resumesApi.getResumeAnalysis(resumeId)
          console.log("Analysis data fetched successfully:", analysisData)
        } catch (analysisError) {
          console.error("Failed to fetch resume analysis:", analysisError)
          toast({
            title: "Analysis Error",
            description: "Could not load resume analysis. Please try again.",
            variant: "destructive",
          })

        }
      }


      setResumeContent({
        title: resumeData.title,
        status: resumeData.status,
        visibility: resumeData.visibility,
        content: contentData,
        analysis: analysisData,
      })

      setVisibility(resumeData.visibility || "private")
    } catch (error) {
      console.error("Failed to fetch resume content:", error)
      setError("Failed to load resume content. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async () => {
    try {
      setIsLoading(true)
      await resumesApi.analyzeResume(resumeId)
      fetchResumeContent()
    } catch (error) {
      console.error("Failed to analyze resume:", error)
      setError("Failed to analyze resume. Please try again.")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive",
      })
    }
  }

  const handleVisibilityChange = async (newVisibility: "private" | "public") => {
    try {
      setIsUpdating(true)
      await resumesApi.updateResume(resumeId, { visibility: newVisibility })
      setVisibility(newVisibility)
      toast({
        title: "Success",
        description: `Resume visibility updated to ${newVisibility}`,
      })
    } catch (error) {
      console.error("Failed to update visibility:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update visibility",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="mb-6">{error}</p>
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-lg">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!resumeContent) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Resume Not Found</h2>
            <p className="mb-6">The resume you're looking for doesn't exist or hasn't been parsed yet.</p>
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-lg">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="rounded-full p-2 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{resumeContent.title}</h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center">
              {visibility === "private" ? (
                <Lock className="h-4 w-4 text-gray-500 mr-2" />
              ) : (
                <Globe className="h-4 w-4 text-green-500 mr-2" />
              )}
              <Select
                value={visibility}
                onValueChange={(value) => handleVisibilityChange(value as "private" | "public")}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[140px] rounded-lg">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {resumeContent.status === "parsed" && (
              <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg" onClick={handleAnalyze}>
                <FileAnalytics className="mr-2 h-4 w-4" /> Analyze Resume
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Replace the personal information section with: */}
            <Card className="border-none shadow-sm rounded-xl mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                {resumeContent.content.full_name ||
                resumeContent.content.email ||
                resumeContent.content.phone ||
                resumeContent.content.location ? (
                  <div className="space-y-2">
                    {resumeContent.content.full_name && (
                      <h3 className="text-lg font-semibold">{resumeContent.content.full_name}</h3>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {resumeContent.content.email && (
                        <div>
                          <span className="font-medium">Email:</span> {resumeContent.content.email}
                        </div>
                      )}
                      {resumeContent.content.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {resumeContent.content.phone}
                        </div>
                      )}
                      {resumeContent.content.location && (
                        <div>
                          <span className="font-medium">Location:</span> {resumeContent.content.location}
                        </div>
                      )}
                      {resumeContent.content.linkedin_url && (
                        <div>
                          <span className="font-medium">LinkedIn:</span> {resumeContent.content.linkedin_url}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No personal information available</p>
                )}
              </CardContent>
            </Card>

            {/* Replace the summary section with: */}
            {resumeContent.content.summary && (
              <Card className="border-none shadow-sm rounded-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{resumeContent.content.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Add a raw text section: */}
            {resumeContent.content.raw_text && (
              <Card className="border-none shadow-sm rounded-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Resume Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg">
                    {resumeContent.content.raw_text}
                  </pre>
                </CardContent>
              </Card>
            )}

            {resumeContent.content.experience && resumeContent.content.experience.length > 0 && (
              <Card className="border-none shadow-sm rounded-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {resumeContent.content.experience.map((exp, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{exp.title}</h3>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {exp.start_date} - {exp.end_date || "Present"}
                          </div>
                        </div>
                        {exp.location && <p className="text-sm text-gray-500 mb-2">{exp.location}</p>}
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {exp.description.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resumeContent.content.education && resumeContent.content.education.length > 0 && (
              <Card className="border-none shadow-sm rounded-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resumeContent.content.education.map((edu, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-semibold">{edu.degree}</h3>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                          </div>
                          <div className="text-sm text-gray-500">{edu.graduation_date}</div>
                        </div>
                        {edu.location && <p className="text-sm text-gray-500 mb-1">{edu.location}</p>}
                        {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                        {edu.description && (
                          <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                            {edu.description.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resumeContent.content.skills && resumeContent.content.skills.length > 0 && (
              <Card className="border-none shadow-sm rounded-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resumeContent.content.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resumeContent.content.projects && resumeContent.content.projects.length > 0 && (
              <Card className="border-none shadow-sm rounded-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {resumeContent.content.projects.map((project, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-semibold mb-2">{project.name}</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm mb-2">
                          {project.description.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        {project.technologies && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.map((tech, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#0071e3] hover:underline mt-1 inline-block"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resumeContent.content.certifications && resumeContent.content.certifications.length > 0 && (
              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resumeContent.content.certifications.map((cert, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          {cert.issuer && <p className="text-sm text-gray-600">{cert.issuer}</p>}
                        </div>
                        {cert.date && <p className="text-sm text-gray-500">{cert.date}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-1">
            {/* Update the analysis section to match the new structure: */}
            {resumeContent.status === "analyzed" && resumeContent.analysis ? (
              <Card className="border-none shadow-sm rounded-xl sticky top-20">
                <CardHeader>
                  <CardTitle className="text-xl">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Resume Scores</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Score</span>
                          <span className="font-medium">{resumeContent.analysis.overall_score.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${(resumeContent.analysis.overall_score / 10) * 100}%`,
                              backgroundColor:
                                resumeContent.analysis.overall_score >= 7
                                  ? "#22c55e"
                                  : resumeContent.analysis.overall_score >= 5
                                    ? "#f59e0b"
                                    : "#ef4444",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Content</span>
                          <span className="font-medium">{resumeContent.analysis.content_score.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                              width: `${(resumeContent.analysis.content_score / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Formatting</span>
                          <span className="font-medium">{resumeContent.analysis.formatting_score.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-purple-500"
                            style={{
                              width: `${(resumeContent.analysis.formatting_score / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ATS Compatibility</span>
                          <span className="font-medium">
                            {resumeContent.analysis.ats_compatibility_score.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{
                              width: `${(resumeContent.analysis.ats_compatibility_score / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-green-600">Strengths</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {resumeContent.analysis.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-red-600">Areas for Improvement</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {resumeContent.analysis.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-[#0071e3]">Suggestions</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {resumeContent.analysis.improvement_suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-sm rounded-xl sticky top-20">
                <CardHeader>
                  <CardTitle className="text-xl">Resume Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <p>
                      {resumeContent.status === "uploaded"
                        ? "Your resume has been uploaded but not yet parsed."
                        : "Your resume has been parsed but not yet analyzed."}
                    </p>
                    {resumeContent.status === "parsed" && (
                      <Button className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg" onClick={handleAnalyze}>
                        <FileAnalytics className="mr-2 h-4 w-4" /> Analyze Resume
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
