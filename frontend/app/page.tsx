import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[#1d1d1f]">Resume AI</h1>
          <p className="text-xl text-[#86868b] max-w-2xl mx-auto">
            Create professional resumes with the power of artificial intelligence. Stand out from the crowd and land
            your dream job.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button className="bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full px-8 py-6 mr-4">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-8 py-6 border-[#0071e3] text-[#0071e3]">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

      </section>

      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#1d1d1f]">Why Choose Resume AI</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-[#0071e3] mb-2" />
              <CardTitle>AI-Powered Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#86868b] text-base">
                Our advanced AI analyzes your experience and skills to suggest impactful content for your resume.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <FileText className="h-10 w-10 text-[#0071e3] mb-2" />
              <CardTitle>Professional Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#86868b] text-base">
                Choose from dozens of ATS-friendly templates designed by hiring professionals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <Zap className="h-10 w-10 text-[#0071e3] mb-2" />
              <CardTitle>Instant Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#86868b] text-base">
                Get real-time analysis and improvement suggestions to optimize your resume for each job application.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center mb-20">
        <h2 className="text-3xl font-bold mb-4 text-[#1d1d1f]">Ready to transform your job search?</h2>
        <p className="text-xl text-[#86868b] max-w-2xl mx-auto mb-8">
          Join thousands of professionals who have accelerated their careers with Resume AI.
        </p>
        <Link href="/register">
          <Button className="bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full px-8 py-6">
            Create Your Resume Now
          </Button>
        </Link>
      </section>
    </div>
  )
}
