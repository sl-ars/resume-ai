import axios from "axios"
import { refreshTokenRequest } from "./auth"

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Define response types based on the API structure
export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: {
    message: string
    code: string
  } | null
}

// Define pagination response type based on Django's format
export type PaginatedData<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Helper function to unwrap API response
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.success && response.data !== null) {
    return response.data
  } else {
    throw new Error(response.error?.message || "An unknown error occurred")
  }
}

// Helper function to unwrap paginated response
export function unwrapPaginatedResponse<T>(response: ApiResponse<PaginatedData<T>>): {
  results: T[]
  pagination: {
    count: number
    next: string | null
    previous: string | null
  }
} {
  if (response.success && response.data) {
    const { results, count, next, previous } = response.data
    return {
      results,
      pagination: {
        count,
        next,
        previous,
      },
    }
  } else {
    throw new Error(response.error?.message || "An unknown error occurred")
  }
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include JWT token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle common errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          const data = await refreshTokenRequest(refreshToken)
          const access = unwrapResponse(data).access
          localStorage.setItem("accessToken", access)

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${access}`

          // Retry the original request
          return axios(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
