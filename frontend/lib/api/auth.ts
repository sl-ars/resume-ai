import apiClient, { type ApiResponse, unwrapResponse } from "./api-client"

// Define types for auth responses
type RegisterResponse = {
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    role: "job_seeker" | "recruiter" | "admin"
    is_email_verified: boolean
  }
  access: string
  refresh: string
}

type TokenResponse = {
  access: string
  refresh: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    role: "job_seeker" | "recruiter" | "admin"
    is_email_verified: boolean
  }
}

type RefreshResponse = {
  access: string
}

type UserProfile = {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "job_seeker" | "recruiter" | "admin"
  is_email_verified: boolean
  bio: string | null
  location: string | null
  phone_number: string | null
  website: string | null
  linkedin_url: string | null
  github_url: string | null
  profile_picture: string | null
}

// Avoid circular dependency by creating a separate function for token refresh
export const refreshTokenRequest = async (refreshToken: string): Promise<ApiResponse<RefreshResponse>> => {
  const response = await apiClient.post<ApiResponse<RefreshResponse>>("/api/auth/token/refresh/", {
    refresh: refreshToken,
  })
  return response.data
}

export const authApi = {
  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string,
    role: "job_seeker" | "recruiter" | "admin" = "job_seeker",
  ): Promise<RegisterResponse> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>("/api/user/register/", {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirm: passwordConfirm,
      role,
    })
    return unwrapResponse(response.data)
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    const response = await apiClient.post<ApiResponse<TokenResponse>>("/api/auth/token/", {
      email,
      password,
    })
    return unwrapResponse(response.data)
  },

  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await refreshTokenRequest(refreshToken)
    return unwrapResponse(response)
  },

  verifyToken: async (token: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<{}>>("/api/auth/token/verify/", {
        token
      })
      return response.data.success
    } catch (error) {
      return false
    }
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/api/user/profile/me/")
    return unwrapResponse(response.data)
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/api/user/request-password-reset/", {
      email,
    })
    unwrapResponse(response.data)
  },

  resetPassword: async (token: string, uid: string, password: string, passwordConfirm: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/api/user/reset-password/", {
      token,
      uid,
      password,
      password_confirm: passwordConfirm,
    })
    unwrapResponse(response.data)
  },

  verifyEmail: async (token: string, uid: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/api/user/verify-email/", {
      token,
      uid,
    })
    unwrapResponse(response.data)
  },

  resendVerificationEmail: async (): Promise<void> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/api/user/resend-verification-email/")
    unwrapResponse(response.data)
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/api/user/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: confirmPassword
    })
    unwrapResponse(response.data)
  },
}
