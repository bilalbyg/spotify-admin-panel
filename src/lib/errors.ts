import axios from "axios"

export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    const backendMessage =
      data?.message ||
      data?.error ||
      data?.detail ||
      data?.title ||
      err.response?.statusText
    if (backendMessage) return backendMessage
    if (err.code === "ERR_NETWORK") {
      return "Backend'e ulaşılamıyor. Lütfen API Gateway'in (localhost:8084) çalıştığından emin olun."
    }
    return err.message || fallback
  }
  if (err instanceof Error) {
    return err.message
  }
  return fallback
}
