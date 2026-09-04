import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'namma-sandhai-sidebar-collapsed'

export const SIDEBAR_WIDTH_EXPANDED = '16rem'
export const SIDEBAR_WIDTH_COLLAPSED = '4.5rem'

interface DashboardShellContextValue {
  collapsed: boolean
  toggleCollapsed: () => void
  sidebarWidth: string
}

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null)

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => !value)
  }, [])

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed,
      sidebarWidth: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    }),
    [collapsed, toggleCollapsed]
  )

  return <DashboardShellContext.Provider value={value}>{children}</DashboardShellContext.Provider>
}

export function useDashboardShell() {
  const context = useContext(DashboardShellContext)
  if (!context) {
    throw new Error('useDashboardShell must be used within DashboardShellProvider')
  }
  return context
}
