import axios from 'axios'

export interface User {
  id: number
  username: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  password: string
}

class AuthService {
  private baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
  private currentUser: User | null = null

  constructor() {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post<User>(`${this.baseUrl}/api/auth/login`, credentials)
      const user = response.data

      this.currentUser = user
      localStorage.setItem('currentUser', JSON.stringify(user))

      return user
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Login fehlgeschlagen')
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axios.post<User>(`${this.baseUrl}/api/auth/register`, credentials)
      const user = response.data

      this.currentUser = user
      localStorage.setItem('currentUser', JSON.stringify(user))

      return user
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Registrierung fehlgeschlagen')
    }
  }

  logout(): void {
    this.currentUser = null
    localStorage.removeItem('currentUser')
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null
  }

  getUserId(): number | null {
    return this.currentUser?.id || null
  }
}

export const authService = new AuthService()
