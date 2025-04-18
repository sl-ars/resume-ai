


export const API_URL = process.env.NEXT_PUBLIC_API_URL


export const ENABLE_ADMIN_FEATURES = process.env.NEXT_PUBLIC_ENABLE_ADMIN_FEATURES === "true"
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false"


export const APP_NAME = "Resume AI"
export const APP_DESCRIPTION = "AI-powered resume builder and analyzer"


export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
