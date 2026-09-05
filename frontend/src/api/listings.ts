import { apiClient, API_BASE } from './client'
import type { Crop } from './market'

export interface ListingMediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  name?: string
}

export interface ListingFarmer {
  id: string
  name: string
  isVerified: boolean
  district: string
  phone?: string
}

export interface DailyPriceMove {
  cropId: string
  cropName: string
  cropNameTamil: string
  district: string
  unit: string
  yesterdayPrice: number
  todayPrice: number
  change: number
  percentChange: number
  direction: 'up' | 'down' | 'stable'
}

export interface Listing {
  id: string
  variety: string | null
  quantity: number
  unit: string
  expectedPrice: number
  district: string
  state: string
  harvestDate: string | null
  availableFrom: string | null
  availableUntil: string | null
  description: string | null
  imageUrl: string | null
  media?: ListingMediaItem[]
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED'
  createdAt: string
  updatedAt: string
  crop: Crop
  farmer: ListingFarmer
  priceMove?: DailyPriceMove | null
}

export interface ListingDetail extends Listing {
  marketAverage: {
    averagePrice: number
    minPrice: number
    maxPrice: number
    unit: string
  } | null
}

export interface FarmerListingsResponse {
  listings: Listing[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    total: number
    active: number
    sold: number
    expired: number
  }
}

export interface MarketplaceResponse {
  listings: Listing[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  priceTicker: DailyPriceMove[]
}

export interface CreateListingPayload {
  cropId: string
  variety?: string
  quantity: number
  unit?: string
  expectedPrice: number
  district?: string
  harvestDate?: string
  availableFrom?: string
  availableUntil?: string
  description?: string
  imageUrl?: string
  media?: ListingMediaItem[]
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const listingsApi = {
  browse: (params: {
    search?: string
    crop?: string
    cropId?: string
    district?: string
    minPrice?: number
    maxPrice?: number
    minQuantity?: number
    available?: boolean
    page?: number
    limit?: number
  }) => apiClient<MarketplaceResponse>(`/listings${buildQuery(params)}`),

  getById: (id: string) => apiClient<ListingDetail>(`/listings/${id}`),

  getMine: (params?: {
    page?: number
    limit?: number
    status?: Listing['status']
    search?: string
  }) => apiClient<FarmerListingsResponse>(`/farmers/listings${buildQuery(params ?? {})}`),

  create: (data: CreateListingPayload) =>
    apiClient<Listing>('/farmers/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateListingPayload> & { status?: string }) =>
    apiClient<Listing>(`/farmers/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ deleted: boolean }>(`/farmers/listings/${id}`, {
      method: 'DELETE',
    }),

  uploadMedia: async (files: File[]) => {
    const token = localStorage.getItem('namma-sandhai-token')
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const response = await fetch(`${API_BASE}/farmers/listings/media`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed')
    }

    return data.data as { media: ListingMediaItem[] }
  },
}
