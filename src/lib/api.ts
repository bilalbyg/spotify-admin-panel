import axios from "axios"

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  username: string
  email: string
}

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("spotify-admin-access-token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function loginUser(
  credentials: LoginRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/v1/auth/login", credentials)
  return response.data
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/v1/auth/refresh-token", {
    refreshToken,
  })
  return response.data
}
