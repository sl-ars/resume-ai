"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { resumesApi } from "@/lib/api/resumes"
import { ArrowLeft, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/components/ui/use-toast"

type ResumeAnalysis = {
  title: string
  status: "completed"
  overall_score: number
  content_score: number
  formatting_score: number
  ats_compatibility_score: number
  strengths: string[]
  weaknesses: string[]
  improvement_suggestions: string[]
}

export default function ResumeAnalysisPage() {
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const resumeId = params?.id as string

  useEffect(() => {
    if (resumeId) {
      fetchResumeAnalysis()
    }
  }, [resumeId])

  const fetchResumeAnalysis = async () => {
    try {
      setIsLoading(true)

      const resumeData = await resumesApi.getById(resumeId)

      if (resumeData.status !== "completed") {
        setError("This resume has not been analyzed yet.")
        return
      }


      try {
        const analysisData = await resumesApi.getResumeAnalysis(resumeId)
        console.log("Analysis data fetched successfully:", analysisData)


        setResumeAnalysis({
          title: resumeData.title,
          status: "completed",
          ...analysisData,
        })
      } catch (analysisError) {
        console.error("Failed to fetch resume analysis:", analysisError)


        if (analysisError instanceof Error) {
          setError(`Failed to load resume analysis: ${analysisError.message}`)
          toast({
            title: "Analysis Error",
            description: analysisError.message,
            variant: "destructive",
          })
        } else {
          setError("Failed to load resume analysis. Please try again.")
          toast({
            title: "Analysis Error",
            description: "Could not load resume analysis. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch resume data:", error)
      setError("Failed to load resume data. Please try again.")
    } finally {
      setIsLoading(false)
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
            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-lg">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
              <Link href={`/resume/${resumeId}/content`}>
                <Button className="rounded-lg bg-[#0071e3] hover:bg-[#0077ED]">
                  <FileText className="mr-2 h-4 w-4" /> View Resume Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!resumeAnalysis) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Analysis Not Found</h2>
            <p className="mb-6">The resume analysis you're looking for doesn't exist or hasn't been completed yet.</p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-lg">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
              <Link href={`/resume/${resumeId}/content`}>
                <Button className="rounded-lg bg-[#0071e3] hover:bg-[#0077ED]">
                  <FileText className="mr-2 h-4 w-4" /> View Resume Content
                </Button>
              </Link>
            </div>
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
          <h1 className="text-2xl font-bold">{resumeAnalysis.title} - Analysis</h1>
          <div className="ml-auto">
            <Link href={`/resume/${resumeId}/content`}>
              <Button variant="outline" className="rounded-lg">
                <FileText className="mr-2 h-4 w-4" /> View Resume Content
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl">Resume Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Score</span>
                    <span className="font-medium">{resumeAnalysis.overall_score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${(resumeAnalysis.overall_score / 10) * 100}%`,
                        backgroundColor:
                          resumeAnalysis.overall_score >= 7
                            ? "#22c55e"
                            : resumeAnalysis.overall_score >= 5
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Content</span>
                    <span className="font-medium">{resumeAnalysis.content_score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${(resumeAnalysis.content_score / 10) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Formatting</span>
                    <span className="font-medium">{resumeAnalysis.formatting_score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{
                        width: `${(resumeAnalysis.formatting_score / 10) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ATS Compatibility</span>
                    <span className="font-medium">{resumeAnalysis.ats_compatibility_score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{
                        width: `${(resumeAnalysis.ats_compatibility_score / 10) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {resumeAnalysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl text-red-600">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {resumeAnalysis.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-xl md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#0071e3]">Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {resumeAnalysis.improvement_suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
