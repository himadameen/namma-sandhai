import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, type AuthUser, type LoginPayload, type RegisterPayload } from '@/api/auth'
import { AuthWelcomeSplash, type AuthWelcomeMode } from '@/components/splash/AuthWelcomeSplash'
import i18n from '@/i18n'
import { clearToken, getToken, setToken, getDashboardPath } from '@/utils/auth'
import type { UserRole } from '@/types'

function applyUserLanguage(language?: string) {
  if (language === 'en' || language === 'ta') {
    void i18n.changeLanguage(language)
  }
}

export interface WelcomeSplashState {
  mode: AuthWelcomeMode
  userName: string
  role: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  welcomeSplash: WelcomeSplashState | null
  login: (data: LoginPayload) => Promise<string>
  register: (data: RegisterPayload) => Promise<string>
  logout: () => void
  refreshUser: () => Promise<void>
  dismissWelcomeSplash: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [welcomeSplash, setWelcomeSplash] = useState<WelcomeSplashState | null>(null)

  const dismissWelcomeSplash = useCallback(() => {
    setWelcomeSplash(null)
  }, [])

  const showWelcomeSplash = useCallback((mode: AuthWelcomeMode, authUser: AuthUser) => {
    setWelcomeSplash({
      mode,
      userName: authUser.name,
      role: authUser.role,
    })
  }, [])

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      return
    }
    try {
      const profile = await authApi.me()
      setUser(profile)
      applyUserLanguage(profile.language)
    } catch {
      clearToken()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = useCallback(
    async (data: LoginPayload) => {
      const result = await authApi.login(data)
      setToken(result.token)
      setUser(result.user)
      applyUserLanguage(result.user.language)
      showWelcomeSplash('login', result.user)
      return getDashboardPath(result.user.role)
    },
    [showWelcomeSplash]
  )

  const register = useCallback(
    async (data: RegisterPayload) => {
      const result = await authApi.register(data)
      setToken(result.token)
      setUser(result.user)
      applyUserLanguage(result.user.language)
      showWelcomeSplash('register', result.user)
      return getDashboardPath(result.user.role)
    },
    [showWelcomeSplash]
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setWelcomeSplash(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      welcomeSplash,
      login,
      register,
      logout,
      refreshUser,
      dismissWelcomeSplash,
    }),
    [user, isLoading, welcomeSplash, login, register, logout, refreshUser, dismissWelcomeSplash]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      {welcomeSplash && (
        <AuthWelcomeSplash
          mode={welcomeSplash.mode}
          userName={welcomeSplash.userName}
          role={welcomeSplash.role}
          onComplete={dismissWelcomeSplash}
        />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
