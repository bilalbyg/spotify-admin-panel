import axios, { type InternalAxiosRequestConfig } from "axios"

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

const ACCESS_TOKEN_KEY = "spotify-admin-access-token"
const REFRESH_TOKEN_KEY = "spotify-admin-refresh-token"
const USER_KEY = "spotify-admin-user"

export const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

let refreshPromise: Promise<string> | null = null

function isPublicAuthEndpoint(url: string | undefined): boolean {
  const endpoint = url?.replace(/^\/api\/v1/, "")
  return [
    "/auth/login",
    "/auth/register",
    "/auth/refresh-token",
    "/auth/logout",
  ].some((path) => endpoint === path || endpoint?.startsWith(`${path}?`))
}

function getRefreshedAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      return Promise.reject(new Error("No refresh token available"))
    }

    refreshPromise = axios
      .post<AuthResponse>("/api/v1/auth/refresh-token", { refreshToken })
      .then(({ data }) => {
        if (!data.accessToken || !data.refreshToken) {
          throw new Error("Token refresh response is incomplete")
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
        return data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function clearAuthAndRedirect() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.location.href = "/login"
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (config.headers) {
    if (token && !isPublicAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      config.headers.delete("Authorization")
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isPublicAuthEndpoint(originalRequest.url) &&
      originalRequest._retry
    ) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isPublicAuthEndpoint(originalRequest.url) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const accessToken = await getRefreshedAccessToken()
        originalRequest.headers.set("Authorization", `Bearer ${accessToken}`)
        return api(originalRequest)
      } catch (refreshError) {
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export async function loginUser(
  credentials: LoginRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", credentials)
  return response.data
}

export interface CountResponse {
  count: number
}

export interface User {
  id: string
  email: string
  username: string
  role: "USER" | "ADMIN"
  subscriptionType: "FREE" | "PREMIUM"
  emailVerified: boolean
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  dateOfBirth: string
  gender:
    | "MAN"
    | "WOMAN"
    | "NON_BINARY"
    | "SOMETHING_ELSE"
    | "PREFER_NOT_TO_SAY"
  role: "USER" | "ADMIN"
  subscriptionType: "FREE" | "PREMIUM"
  emailVerified: boolean
}

export interface UpdateUserRequest {
  username: string
  role: "USER" | "ADMIN"
  subscriptionType: "FREE" | "PREMIUM"
  emailVerified: boolean
}

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>("/auth/users")
  return response.data
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  const response = await api.post<User>("/auth/users", request)
  return response.data
}

export async function updateUser(
  id: string,
  request: UpdateUserRequest
): Promise<User> {
  const response = await api.put<User>(`/auth/users/${id}`, request)
  return response.data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/auth/users/${id}`)
}

// ============================================================
// CATALOG ENTITY TİPLERİ
// ============================================================

export interface Song {
  id: string
  title: string
  duration: number
  audioUrl: string
  albumId: string
  albumTitle: string
}

export interface Artist {
  id: string
  name: string
  bio: string
  imageUrl: string | null
  popularity: number
}

export interface Album {
  id: string
  title: string
  releaseYear: number
  coverImageUrl: string | null
  artistId: string
  artistName: string
}

export interface Playlist {
  id: string
  name: string
  description: string
  coverImageUrl: string
  isPublic: boolean
  ownerId: string
}

export interface Podcast {
  id: string
  title: string
  description: string
  publisher: string
  coverImageUrl: string
}

export interface Episode {
  id: string
  title: string
  description: string
  duration: number
  audioUrl: string
  releaseDate: string
  podcastId: string
}

export interface Genre {
  id: string
  name: string
  iconUrl: string
}

// ============================================================
// SONGS
// ============================================================

export async function getSongs(): Promise<Song[]> {
  const response = await api.get<Song[]>("/songs")
  return response.data
}

export async function createSong(formData: FormData): Promise<Song> {
  const response = await api.post<Song>("/songs", formData, {
    headers: { "Content-Type": undefined },
  })
  return response.data
}

export interface UpdateSongPayload {
  title: string
  duration: number
  albumId: string
}

export async function updateSong(
  id: string,
  payload: UpdateSongPayload
): Promise<Song> {
  const response = await api.put<Song>(`/songs/${id}`, payload)
  return response.data
}

export async function deleteSong(id: string): Promise<void> {
  await api.delete(`/songs/${id}`)
}

// ============================================================
// ARTISTS
// ============================================================

export async function getArtists(): Promise<Artist[]> {
  const response = await api.get<Artist[]>("/artists")
  return response.data
}

export async function createArtist(formData: FormData): Promise<Artist> {
  const response = await api.post<Artist>("/artists", formData, {
    headers: { "Content-Type": undefined },
  })
  return response.data
}

export async function createManyArtists(
  artists: { name: string; bio: string; image?: File }[]
): Promise<{ created: Artist[]; failed: { name: string; error: unknown }[] }> {
  const created: Artist[] = []
  const failed: { name: string; error: unknown }[] = []

  for (const artist of artists) {
    try {
      const formData = new FormData()
      formData.append("name", artist.name)
      formData.append("bio", artist.bio)
      if (artist.image) {
        formData.append("image", artist.image)
      }
      const result = await createArtist(formData)
      created.push(result)
    } catch (error) {
      failed.push({ name: artist.name, error })
    }
  }

  return { created, failed }
}

export interface UpdateArtistPayload {
  name: string
  bio: string
}

export async function updateArtist(
  id: string,
  payload: UpdateArtistPayload
): Promise<Artist> {
  const response = await api.put<Artist>(`/artists/${id}`, payload)
  return response.data
}

export async function deleteArtist(id: string): Promise<void> {
  await api.delete(`/artists/${id}`)
}

// ============================================================
// ALBUMS
// ============================================================

export async function getAlbums(): Promise<Album[]> {
  const response = await api.get<Album[]>("/albums")
  return response.data
}

export async function createAlbum(formData: FormData): Promise<Album> {
  const response = await api.post<Album>("/albums", formData, {
    headers: { "Content-Type": undefined },
  })
  return response.data
}

export interface UpdateAlbumPayload {
  title: string
  releaseYear: number
  artistId: string
}

export async function updateAlbum(
  id: string,
  payload: UpdateAlbumPayload
): Promise<Album> {
  const response = await api.put<Album>(`/albums/${id}`, payload)
  return response.data
}

export async function deleteAlbum(id: string): Promise<void> {
  await api.delete(`/albums/${id}`)
}

// ============================================================
// PLAYLISTS
// ============================================================

export interface PlaylistPayload {
  name: string
  description: string
  coverImageUrl: string
  isPublic: boolean
  ownerId: string
}

export async function getPlaylists(): Promise<Playlist[]> {
  const response = await api.get<Playlist[]>("/playlists")
  return response.data
}

export async function createPlaylist(
  payload: PlaylistPayload
): Promise<Playlist> {
  const response = await api.post<Playlist>("/playlists", payload)
  return response.data
}

export async function updatePlaylist(
  id: string,
  payload: PlaylistPayload
): Promise<Playlist> {
  const response = await api.put<Playlist>(`/playlists/${id}`, payload)
  return response.data
}

export async function deletePlaylist(id: string): Promise<void> {
  await api.delete(`/playlists/${id}`)
}

// ============================================================
// PODCASTS
// ============================================================

export interface PodcastPayload {
  title: string
  description: string
  publisher: string
  coverImageUrl: string
}

export async function getPodcasts(): Promise<Podcast[]> {
  const response = await api.get<Podcast[]>("/podcasts")
  return response.data
}

export async function createPodcast(payload: PodcastPayload): Promise<Podcast> {
  const response = await api.post<Podcast>("/podcasts", payload)
  return response.data
}

export async function updatePodcast(
  id: string,
  payload: PodcastPayload
): Promise<Podcast> {
  const response = await api.put<Podcast>(`/podcasts/${id}`, payload)
  return response.data
}

export async function deletePodcast(id: string): Promise<void> {
  await api.delete(`/podcasts/${id}`)
}

// ============================================================
// EPISODES
// ============================================================

export interface EpisodePayload {
  title: string
  description: string
  duration: number
  audioUrl: string
  releaseDate: string
  podcastId: string
}

export async function getEpisodes(): Promise<Episode[]> {
  const response = await api.get<Episode[]>("/episodes")
  return response.data
}

export async function createEpisode(payload: EpisodePayload): Promise<Episode> {
  const response = await api.post<Episode>("/episodes", payload)
  return response.data
}

export async function updateEpisode(
  id: string,
  payload: EpisodePayload
): Promise<Episode> {
  const response = await api.put<Episode>(`/episodes/${id}`, payload)
  return response.data
}

export async function deleteEpisode(id: string): Promise<void> {
  await api.delete(`/episodes/${id}`)
}

// ============================================================
// GENRES
// ============================================================

export async function getGenres(): Promise<Genre[]> {
  const response = await api.get<Genre[]>("/genres")
  return response.data
}

export async function getSongsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/songs")
  return response.data.length
}

export async function getArtistsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/artists")
  return response.data.length
}

export async function getAlbumsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/albums")
  return response.data.length
}

export async function getPlaylistsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/playlists")
  return response.data.length
}

export async function getPodcastsCount(): Promise<number> {
  const response = await api.get<unknown[]>("/podcasts")
  return response.data.length
}

export async function getUsersCount(): Promise<number> {
  const response = await api.get<CountResponse>("/auth/users/count")
  return response.data.count
}
