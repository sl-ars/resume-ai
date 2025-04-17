import apiClient, { type ApiResponse, unwrapResponse } from "./api-client"

export type Company = {
  id: string
  name: string
  description: string
  website: string
  logo: string
  recruiters: Array<{
    id: number
    email: string
    first_name: string
    last_name: string
  }>
  created_at: string
  updated_at: string
}

export type CompanyCreateUpdateRequest = {
  name: string
  description?: string
  website?: string
  logo?: File | null
}

export const companiesApi = {
  // Get the current user's company
  getCurrentUserCompany: async (): Promise<Company> => {
    const response = await apiClient.get<ApiResponse<Company>>("/api/companies/my-company/")
    return unwrapResponse(response.data)
  },

  // Get a company by ID
  getCompanyById: async (companyId: string): Promise<Company> => {
    const response = await apiClient.get<ApiResponse<Company>>(`/api/companies/${companyId}/`)
    return unwrapResponse(response.data)
  },

  // Create a new company
  createCompany: async (companyData: CompanyCreateUpdateRequest): Promise<Company> => {
    // Create a FormData object to handle file uploads
    const formData = new FormData()
    formData.append("name", companyData.name)
    
    if (companyData.description) {
      formData.append("description", companyData.description)
    }
    
    if (companyData.website) {
      formData.append("website", companyData.website)
    }
    
    if (companyData.logo) {
      formData.append("logo", companyData.logo)
    }
    
    const response = await apiClient.post<ApiResponse<Company>>("/api/companies/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return unwrapResponse(response.data)
  },

  // Update an existing company
  updateCompany: async (companyId: string, companyData: Partial<CompanyCreateUpdateRequest>): Promise<Company> => {
    // Create a FormData object to handle file uploads
    const formData = new FormData()
    
    if (companyData.name !== undefined) {
      formData.append("name", companyData.name)
    }
    
    if (companyData.description !== undefined) {
      formData.append("description", companyData.description)
    }
    
    if (companyData.website !== undefined) {
      formData.append("website", companyData.website)
    }
    
    if (companyData.logo) {
      formData.append("logo", companyData.logo)
    }
    
    const response = await apiClient.patch<ApiResponse<Company>>(`/api/companies/${companyId}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return unwrapResponse(response.data)
  },

  // Delete a company
  deleteCompany: async (companyId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/companies/${companyId}/`)
    unwrapResponse(response.data)
  },

  // Add a recruiter to a company
  addRecruiter: async (companyId: string, recruiterId: number): Promise<Company> => {
    const response = await apiClient.post<ApiResponse<Company>>(`/api/companies/${companyId}/add_recruiter/`, {
      user_id: recruiterId,
    })
    return unwrapResponse(response.data)
  },
} 