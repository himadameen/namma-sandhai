import { Navigate } from 'react-router-dom'
import { MarketplaceBrowse } from '@/components/marketplace/MarketplaceBrowse'
import { useAuth } from '@/store/auth'

export function MarketplacePage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (isAuthenticated && user?.role === 'BUYER') {
    return <Navigate to="/buyer/marketplace" replace />
  }

  return <MarketplaceBrowse variant="public" basePath="/marketplace" />
}
