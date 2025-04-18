"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { resumesApi } from "@/lib/api/resumes"
import { FileUp, Loader2, X, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthGuard from "@/components/auth-guard"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/app/config"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [visibility, setVisibility] = useState<"private" | "public">("private")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    setError("")


    const fileType = selectedFile.type
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      setError("Please upload a PDF or DOCX file")
      return
    }


    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
      return
    }

    setFile(selectedFile)


    if (!title) {
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "")
      setTitle(fileName)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please enter a title for your resume")
      return
    }

    if (!file) {
      setError("Please upload a resume file")
      return
    }

    try {
      setIsUploading(true)
      await resumesApi.uploadResume(title, file, visibility)
      router.push("/dashboard")
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload resume. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto flex items-center justify-center py-12">
        <Card className="w-full max-w-lg border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Upload Resume</CardTitle>
            <CardDescription>Upload your resume in PDF or DOCX format to get started with AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resume Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={(value) => setVisibility(value as "private" | "public")}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you can see)</SelectItem>
                    <SelectItem value="public">Public (Visible to recruiters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Resume File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-[#0071e3] bg-blue-50"
                      : file
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-[#0071e3] hover:bg-blue-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile()
                        }}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileUp className="h-10 w-10 text-gray-400 mx-auto" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-[#0071e3]">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PDF or DOCX (max {MAX_FILE_SIZE / (1024 * 1024)}MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={isUploading || !file || !title.trim()}
              className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                "Upload Resume"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AuthGuard>
  )
}
