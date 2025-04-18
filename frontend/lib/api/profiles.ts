import apiClient, { type ApiResponse, unwrapResponse } from "./api-client"

type Profile = {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  bio: string | null
  location: string | null
  phone_number: string | null
  website: string | null
  linkedin_url: string | null
  github_url: string | null
  profile_picture: string | null
}

type ProfileUpdateRequest = {
  first_name: string
  last_name: string
  bio?: string | null
  location?: string | null
  phone_number?: string | null
  website?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  profile_picture?: File | null
}

export const profilesApi = {
  getMyProfile: async (): Promise<Profile> => {
    const response = await apiClient.get<ApiResponse<Profile>>("/api/user/profile/me/")
    return unwrapResponse(response.data)
  },

  updateMyProfile: async (data: ProfileUpdateRequest): Promise<Profile> => {
    // Create FormData if there's a profile picture
    if (data.profile_picture) {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value)
        }
      })

      const response = await apiClient.patch<ApiResponse<Profile>>("/api/user/profile/update-me/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return unwrapResponse(response.data)
    } else {
      // Regular JSON request if no file is being uploaded
      const response = await apiClient.patch<ApiResponse<Profile>>("/api/user/profile/update-me/", data)
      return unwrapResponse(response.data)
    }
  },
}
