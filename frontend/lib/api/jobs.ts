import apiClient, { type ApiResponse, type PaginatedData, unwrapResponse, unwrapPaginatedResponse } from "./api-client"

type JobBasic = {
  id: string
  user: number
  title: string
  description: string
  skills_required: string[]
  status: "approved" | "pending" | "rejected"
  created_at: string
  updated_at: string
  company?: {
    id: string
    name: string
    description: string
    website: string
    logo: string | null
    created_at: string
    updated_at: string
  }
}

type Job = {
  id: string
  title: string
  description: string
  skills_required: string[]
  location: string | null
  is_remote: boolean
  status: "approved" | "pending" | "rejected"
  created_at: string
  updated_at: string
  company?: {
    id: string
    name: string
    description: string
    website: string
    logo: string | null
    created_at: string
    updated_at: string
  }
}

type JobApplication = {
  id: string
  applicant_email: string
  resume_title: string
  job: {
    id: string
    title: string
    description: string
    skills_required: string[]
    location: string | null
    is_remote: boolean
    status: "approved" | "pending" | "rejected"
    created_at: string
    updated_at: string
    company?: {
      id: string
      name: string
      description: string
      website: string
      logo: string | null
      created_at: string
      updated_at: string
    }
  }
  is_approved: boolean
  created_at: string
}

type JobCreateRequest = {
  title: string
  description: string
  skills_required: string[]
}

export const jobsApi = {
  // Job listings
  getAllJobs: async (page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<JobBasic>>>("/api/jobs/job/", {
      params: { page, limit },
    })
    return unwrapPaginatedResponse(response.data)
  },

  getJobById: async (jobId: string): Promise<Job> => {
    const response = await apiClient.get<ApiResponse<Job>>(`/api/jobs/job/${jobId}/`)
    return unwrapResponse(response.data)
  },

  createJob: async (jobData: JobCreateRequest): Promise<Job> => {
    const response = await apiClient.post<ApiResponse<Job>>("/api/jobs/job/", jobData)
    return unwrapResponse(response.data)
  },

  updateJob: async (jobId: string, jobData: Partial<JobCreateRequest>): Promise<Job> => {
    const response = await apiClient.patch<ApiResponse<Job>>(`/api/jobs/job/${jobId}/`, jobData)
    return unwrapResponse(response.data)
  },

  deleteJob: async (jobId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/jobs/job/${jobId}/`)
    unwrapResponse(response.data)
  },

  approveJob: async (jobId: string): Promise<Job> => {
    const response = await apiClient.post<ApiResponse<Job>>(`/api/jobs/job/${jobId}/approve/`)
    return unwrapResponse(response.data)
  },

  // Job applications
  getAllApplications: async (page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<JobApplication>>>("/api/jobs/applications/", {
      params: { page, limit },
    })
    return unwrapPaginatedResponse(response.data)
  },

  getUserApplications: async (page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<JobApplication>>>("/api/jobs/applications/", {
      params: { page, limit },
    })
    return unwrapPaginatedResponse(response.data)
  },

  getApplicationById: async (applicationId: string): Promise<JobApplication> => {
    const response = await apiClient.get<ApiResponse<JobApplication>>(`/api/jobs/applications/${applicationId}/`)
    return unwrapResponse(response.data)
  },

  getJobApplications: async (jobId: string, page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<JobApplication>>>(
      `/api/jobs/job/${jobId}/applications/`,
      {
        params: { page, limit },
      },
    )
    return unwrapPaginatedResponse(response.data)
  },

  applyToJob: async (jobId: string, resumeId: string): Promise<JobApplication> => {
    const response = await apiClient.post<ApiResponse<JobApplication>>(`/api/jobs/job/${jobId}/apply/`, {
      resume_id: resumeId,
    })
    return unwrapResponse(response.data)
  },

  approveApplication: async (applicationId: string): Promise<JobApplication> => {
    const response = await apiClient.post<ApiResponse<JobApplication>>(
      `/api/jobs/applications/${applicationId}/approve/`,
    )
    return unwrapResponse(response.data)
  },

  rejectApplication: async (applicationId: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(`/api/jobs/applications/${applicationId}/reject/`)
    unwrapResponse(response.data)
  },

  withdrawApplication: async (applicationId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/jobs/applications/${applicationId}/`)
    unwrapResponse(response.data)
  },

  // Resume matching
  matchResumeToJob: async (jobId: string, resumeId: string): Promise<{ score: number; matches: any[] }> => {
    const response = await apiClient.post<ApiResponse<{ score: number; matches: any[] }>>(
      `/api/jobs/job/${jobId}/match/`,
      {
        resume_id: resumeId,
      },
    )
    return unwrapResponse(response.data)
  },

  selfMatchToJob: async (jobId: string): Promise<{ score: number; matches: any[] }> => {
    const response = await apiClient.post<ApiResponse<{ score: number; matches: any[] }>>(
      `/api/jobs/job/${jobId}/self-match/`,
    )
    return unwrapResponse(response.data)
  },
}
