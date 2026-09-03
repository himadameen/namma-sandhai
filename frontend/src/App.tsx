import { useCallback, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/store/auth'
import { HelpdeskWidget } from '@/components/layout/HelpdeskWidget'
import {
  SplashScreen,
  SPLASH_SESSION_KEY,
  shouldShowSplash,
} from '@/components/splash/SplashScreen'
import { router } from '@/routes'
import './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function App() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash)

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem(SPLASH_SESSION_KEY, '1')
    setShowSplash(false)
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <HelpdeskWidget />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
