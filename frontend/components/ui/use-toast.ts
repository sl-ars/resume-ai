"use client"

// Simplified version of the toast hook for demonstration
import { useState } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prev) => [...prev, props])
    // In a real implementation, we would handle displaying the toast
    console.log("Toast:", props)
  }

  return { toast, toasts }
}
