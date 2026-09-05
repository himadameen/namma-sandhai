import type { UserRole } from '@/types'

export function getMarketplaceBasePath(role?: UserRole | null): string {
  return role === 'BUYER' ? '/buyer/marketplace' : '/marketplace'
}

export function getListingDetailPath(listingId: string, role?: UserRole | null): string {
  return `${getMarketplaceBasePath(role)}/${listingId}`
}
