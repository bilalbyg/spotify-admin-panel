import { createContext } from "react"

export interface User {
  email: string
  role: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (
    email: string,
    password: string
  ) => { success: boolean; error?: string }
  signup: (
    username: string,
    email: string,
    password: string
  ) => { success: boolean; error?: string }
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
