import { unwrapResponse, unwrapPaginatedResponse } from "./api-client"

// Export all API modules
export * from "./auth"
export * from "./resumes"
export * from "./jobs"
export * from "./companies"
export * from "./applications"

// Export the API client for direct use if needed
export { default as apiClient } from "./api-client"
export { unwrapResponse, unwrapPaginatedResponse }
