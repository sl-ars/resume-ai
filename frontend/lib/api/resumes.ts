import apiClient, { type ApiResponse, type PaginatedData, unwrapResponse, unwrapPaginatedResponse } from "./api-client"

type Resume = {
  id: string
  title: string
  created_at: string
  status: "pending" | "processing" | "completed" | "failed"
  visibility: "private" | "public"
}

type ResumeContent = {
  title: string
  status: "pending" | "processing" | "completed" | "failed"
  content: {
    personal_info?: {
      name?: string
      email?: string
      phone?: string
      location?: string
      linkedin?: string
      website?: string
    }
    summary?: string
    experience?: Array<{
      title: string
      company: string
      location?: string
      start_date: string
      end_date?: string
      description: string[]
    }>
    education?: Array<{
      degree: string
      institution: string
      location?: string
      graduation_date: string
      gpa?: string
      description?: string[]
    }>
    skills?: string[]
    certifications?: Array<{
      name: string
      issuer?: string
      date?: string
    }>
    projects?: Array<{
      name: string
      description: string[]
      technologies?: string[]
      url?: string
    }>
  }
  analysis?: {
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
    ats_score?: number
  }
}

type UploadResponse = {
  id: string
  title: string
  status: "pending"
}

type ParseResponse = {
  id: string
  status: "processing"
}

type AnalyzeResponse = {
  id: string
  status: "completed"
}

export const resumesApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Resume>>>("/api/resumes/", {
      params: { page, limit },
    })
    return unwrapPaginatedResponse(response.data)
  },

  getById: async (resumeId: string): Promise<Resume> => {
    const response = await apiClient.get<ApiResponse<Resume>>(`/api/resumes/${resumeId}/`)
    return unwrapResponse(response.data)
  },

  uploadResume: async (
    title: string,
    file: File,
    visibility: "private" | "public" = "private",
  ): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("title", title)
    formData.append("file", file)
    formData.append("visibility", visibility)

    const response = await apiClient.post<ApiResponse<UploadResponse>>("/api/resumes/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return unwrapResponse(response.data)
  },

  parseResume: async (resumeId: string): Promise<ParseResponse> => {
    const response = await apiClient.post<ApiResponse<ParseResponse>>(`/api/resumes/${resumeId}/parse/`)
    return unwrapResponse(response.data)
  },

  analyzeResume: async (resumeId: string): Promise<AnalyzeResponse> => {
    const response = await apiClient.post<ApiResponse<AnalyzeResponse>>(`/api/resumes/${resumeId}/analyze/`)
    return unwrapResponse(response.data)
  },

  getResumeAnalysis: async (
    resumeId: string,
  ): Promise<{
    overall_score: number
    content_score: number
    formatting_score: number
    ats_compatibility_score: number
    strengths: string[]
    weaknesses: string[]
    improvement_suggestions: string[]
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        _id: string
        resume_id: string
        user_id: number
        overall_score: number
        content_score: number
        formatting_score: number
        ats_compatibility_score: number
        strengths: string[]
        weaknesses: string[]
        improvement_suggestions: string[]
      }>
    >(`/api/resumes/${resumeId}/analyze/`)

    const data = unwrapResponse(response.data)
    return {
      overall_score: data.overall_score,
      content_score: data.content_score,
      formatting_score: data.formatting_score,
      ats_compatibility_score: data.ats_compatibility_score,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      improvement_suggestions: data.improvement_suggestions,
    }
  },

  getResumeContent: async (
    resumeId: string,
  ): Promise<{
    full_name: string | null
    email: string | null
    phone: string | null
    location: string | null
    linkedin_url: string | null
    summary: string | null
    raw_text: string | null
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        full_name: string | null
        email: string | null
        phone: string | null
        location: string | null
        linkedin_url: string | null
        summary: string | null
        raw_text: string | null
      }>
    >(`/api/resumes/${resumeId}/content/`)
    return unwrapResponse(response.data)
  },

  updateResume: async (
    resumeId: string,
    data: { title?: string; visibility?: "private" | "public" },
  ): Promise<Resume> => {
    const response = await apiClient.patch<ApiResponse<Resume>>(`/api/resumes/${resumeId}/`, data)
    return unwrapResponse(response.data)
  },
}
