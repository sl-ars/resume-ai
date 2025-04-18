import apiClient, { type ApiResponse, type PaginatedData, unwrapResponse, unwrapPaginatedResponse } from "./api-client"

// Define the Company type
export type Company = {
  id: string
  name: string
  description: string | null
  website: string | null
  logo: string | null
  created_at: string
  updated_at: string
}

// Define the job in application response
export type JobInApplication = {
  id: string
  title: string
  description: string
  company?: Company
  skills_required: string[]
  location: string | null
  is_remote: boolean
  status: string
  created_at: string
  updated_at: string
}

// Define the basic Application type based on actual API response
export type Application = {
  id: string
  applicant_email: string
  resume_title: string
  job: JobInApplication
  is_approved: boolean
  created_at: string
  resume_id: string
  
  // Optional fields that may appear in some API responses
  status?: "pending" | "reviewed" | "approved" | "rejected"
  notes?: string
  cover_letter?: string
  
  // These fields might exist in older API versions
  applicant?: {
    id: string
    name: string
    email: string
    profile_picture?: string
  }
  resume_url?: string
  
  // Resume object based on API response
  resume?: {
    id: string
    title: string
    file: string
    file_type: string
    status: string
    visibility: string
    original_filename: string
    created_at: string
    updated_at: string
  }
}

// Legacy type for backward compatibility
export type ApplicationWithApplicant = Application & {
  applicant: {
    id: string
    name: string
    email: string
    profile_picture?: string
  }
}

export type ApplicationStatusUpdateRequest = {
  status: "pending" | "reviewed" | "approved" | "rejected"
  notes?: string
}

export const applicationsApi = {
  // Get all applications for current recruiter
  getAllApplications: async (page = 1, limit = 10, params?: { status?: string, search?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Application>>>("/api/jobs/applications/", {
      params: { page, limit, ...params },
    })
    return unwrapPaginatedResponse(response.data)
  },

  // Get applications for a specific job
  getJobApplications: async (jobId: string, page = 1, limit = 10, params?: { status?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Application>>>(
      `/api/jobs/job/${jobId}/applications/`,
      {
        params: { page, limit, ...params },
      }
    )
    return unwrapPaginatedResponse(response.data)
  },

  // Get application details
  getApplicationById: async (applicationId: string): Promise<Application> => {
    const response = await apiClient.get<ApiResponse<Application>>(`/api/jobs/applications/${applicationId}/`)
    return unwrapResponse(response.data)
  },

  // Update application status
  updateApplicationStatus: async (applicationId: string, updateData: ApplicationStatusUpdateRequest): Promise<Application> => {
    const response = await apiClient.patch<ApiResponse<Application>>(
      `/api/jobs/applications/${applicationId}/`,
      updateData
    )
    return unwrapResponse(response.data)
  },

  // Approve application
  approveApplication: async (applicationId: string, notes?: string): Promise<Application> => {
    const response = await apiClient.post<ApiResponse<Application>>(
      `/api/jobs/applications/${applicationId}/approve/`,
      notes ? { notes } : {}
    )
    return unwrapResponse(response.data)
  },

  // Reject application
  rejectApplication: async (applicationId: string, notes?: string): Promise<Application> => {
    const response = await apiClient.post<ApiResponse<Application>>(
      `/api/jobs/applications/${applicationId}/reject/`,
      notes ? { notes } : {}
    )
    return unwrapResponse(response.data)
  },

  // Mark application as reviewed
  markAsReviewed: async (applicationId: string, notes?: string): Promise<Application> => {
    const response = await apiClient.post<ApiResponse<Application>>(
      `/api/jobs/applications/${applicationId}/review/`,
      notes ? { notes } : {}
    )
    return unwrapResponse(response.data)
  },

  // Add notes to application
  addNotes: async (applicationId: string, notes: string): Promise<Application> => {
    const response = await apiClient.patch<ApiResponse<Application>>(
      `/api/jobs/applications/${applicationId}/`,
      { notes }
    )
    return unwrapResponse(response.data)
  },

  // Download resume
  getResumeDownloadUrl: (resumeId: string): string => {
    return `${apiClient.defaults.baseURL}/api/resumes/${resumeId}/download/`
  }
} 