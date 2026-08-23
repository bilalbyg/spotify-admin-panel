import { useState, type ReactNode } from "react"
import axios from "axios"
import { AuthContext } from "./AuthContextDef"
import type { User, AuthResult } from "./AuthContextDef"
import { loginUser } from "@/lib/api"

const ACCESS_TOKEN_KEY = "spotify-admin-access-token"
const REFRESH_TOKEN_KEY = "spotify-admin-refresh-token"
const USER_KEY = "spotify-admin-user"

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null
  const storedUser = localStorage.getItem(USER_KEY)
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!getInitialUser() && !!getInitialToken()
  )
  const [isLoading, setIsLoading] = useState(false)

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setIsLoading(true)
    try {
      const data = await loginUser({ email, password })
      const userData: User = { email: data.email, role: "admin" }

      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error: unknown) {
      let message = "INVALID CREDENTIALS — ACCESS DENIED"

      if (axios.isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.message || error.response?.data?.error
        if (backendMessage) {
          message = backendMessage
        } else if (error.code === "ERR_NETWORK") {
          message = "BACKEND UNREACHABLE — VERIFY AUTH-SERVICE IS RUNNING"
        } else if (error.message) {
          message = error.message
        }
      } else if (error instanceof Error) {
        message = error.message
      }

      return { success: false, error: message.toUpperCase() }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    if (!username || !email || !password) {
      return { success: false, error: "ALL FIELDS REQUIRED" }
    }
    const userData: User = { email, role: "user" }
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    clearAuthStorage()
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
