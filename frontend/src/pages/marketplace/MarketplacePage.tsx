import { Navigate } from 'react-router-dom'
import { MarketplaceBrowse } from '@/components/marketplace/MarketplaceBrowse'
import { useAuth } from '@/store/auth'

export function MarketplacePage() {
  const { user, isAuthenticated } = useAuth()

  if (isAuthenticated && user?.role === 'BUYER') {
    return <Navigate to="/buyer/marketplace" replace />
  }

  return <MarketplaceBrowse variant="public" basePath="/marketplace" />
}
