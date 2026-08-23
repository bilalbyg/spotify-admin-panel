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

export interface CountResponse {
  count: number
}

export async function getSongsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/v1/songs")
  return response.data.length
}

export async function getArtistsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/v1/artists")
  return response.data.length
}

export async function getAlbumsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/v1/albums")
  return response.data.length
}

export async function getPlaylistsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/v1/playlists")
  return response.data.length
}

export async function getPodcastsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/v1/podcasts")
  return response.data.length
}

export async function getUsersCount(): Promise<number> {
  const response = await api.get<CountResponse>("/v1/auth/users/count")
  return response.data.count
}
