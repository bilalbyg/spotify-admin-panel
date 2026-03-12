import { useState, type ReactNode } from "react"
import { AuthContext } from "./AuthContextDef"
import type { User } from "./AuthContextDef"

const DEV_CREDENTIALS = {
  email: "admin@admin.com",
  password: "admin123",
}

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null
  const storedUser = localStorage.getItem("spotify-admin-user")
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem("spotify-admin-user")
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!getInitialUser()
  )
  const [isLoading] = useState(false)

  const login = (email: string, password: string) => {
    if (
      email === DEV_CREDENTIALS.email &&
      password === DEV_CREDENTIALS.password
    ) {
      const userData = { email, role: "admin" }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem("spotify-admin-user", JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: "INVALID CREDENTIALS — ACCESS DENIED" }
  }

  const signup = (username: string, email: string, password: string) => {
    if (!username || !email || !password) {
      return { success: false, error: "ALL FIELDS REQUIRED" }
    }
    const userData = { email, role: "user" }
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("spotify-admin-user", JSON.stringify(userData))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("spotify-admin-user")
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
