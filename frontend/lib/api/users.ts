import apiClient, { type ApiResponse, type PaginatedData, unwrapResponse, unwrapPaginatedResponse } from "./api-client"

type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "job_seeker" | "recruiter" | "admin"
  is_email_verified: boolean
  created_at: string
  updated_at: string
}

type UserUpdateRequest = {
  email?: string
  first_name?: string
  last_name?: string
  role?: "job_seeker" | "recruiter" | "admin"
}

// Admin-only endpoints
export const usersApi = {
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<User>>>("/api/user/", {
      params: { page, limit },
    })
    return unwrapPaginatedResponse(response.data)
  },

  getUserById: async (userId: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/api/user/${userId}/`)
    return unwrapResponse(response.data)
  },

  updateUser: async (userId: number, data: UserUpdateRequest): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/api/user/${userId}/`, data)
    return unwrapResponse(response.data)
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/user/${userId}/`)
    // No need to unwrap as delete returns 204 No Content
  },
}
