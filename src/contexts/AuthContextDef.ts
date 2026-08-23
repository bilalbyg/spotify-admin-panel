import { createContext } from "react"

export interface User {
  email: string
  role: string
}

export interface AuthResult {
  success: boolean
  error?: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<AuthResult>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
