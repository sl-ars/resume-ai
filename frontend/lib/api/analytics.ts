import apiClient, { type ApiResponse, type PaginatedData, unwrapPaginatedResponse } from "./api-client"

type LogEntry = {
  id: string
  timestamp: string
  level: "info" | "warning" | "error"
  message: string
  user_id?: string
  user_email?: string
  endpoint?: string
  method?: string
  status_code?: number
}

// Admin-only endpoints
export const analyticsApi = {
  getLogs: async (params?: { page?: number; limit?: number; level?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedData<LogEntry>>>("/api/analytics/logs/", { params })
    return unwrapPaginatedResponse(response.data)
  },

  getLogById: async (logId: string) => {
    const response = await apiClient.get<ApiResponse<LogEntry>>(`/api/analytics/logs/${logId}/`)
    return unwrapPaginatedResponse(response.data)
  },
}
