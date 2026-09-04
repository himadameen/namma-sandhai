import { apiClient } from './client'
import type { Crop } from './market'

export type PurchaseRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED'
export type DeliveryType = 'PICKUP' | 'DELIVERY'

export interface PurchaseRequest {
  id: string
  listingId: string
  quantity: number
  offeredPrice: number
  deliveryType: DeliveryType
  message: string | null
  status: PurchaseRequestStatus
  createdAt: string
  updatedAt: string
  buyer: {
    id: string
    name: string
    organization: string | null
    district: string
  }
  listing: {
    id: string
    quantity: number
    unit: string
    expectedPrice: number
    district: string
    crop: Crop
    farmer: { id: string; name: string; userId: string }
  }
  order: { id: string; status: string } | null
}

export interface FarmerPurchaseRequestsResponse {
  requests: PurchaseRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    total: number
    pending: number
    accepted: number
    rejected: number
    countered: number
    actionRequired: number
  }
}

export interface CreatePurchaseRequestPayload {
  listingId: string
  quantity: number
  offeredPrice: number
  deliveryType: DeliveryType
  message?: string
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const purchaseRequestsApi = {
  create: (data: CreatePurchaseRequestPayload) =>
    apiClient<PurchaseRequest>('/buyers/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBuyerRequests: () => apiClient<PurchaseRequest[]>('/buyers/purchase-requests'),

  getFarmerRequests: (params?: {
    page?: number
    limit?: number
    status?: PurchaseRequestStatus
    cropId?: string
    deliveryType?: DeliveryType
    search?: string
  }) =>
    apiClient<FarmerPurchaseRequestsResponse>(
      `/farmers/purchase-requests${buildQuery(params ?? {})}`
    ),

  accept: (id: string) =>
    apiClient<PurchaseRequest>(`/farmers/purchase-requests/${id}/accept`, { method: 'POST' }),

  reject: (id: string) =>
    apiClient<PurchaseRequest>(`/farmers/purchase-requests/${id}/reject`, { method: 'POST' }),

  counter: (id: string, data: { offeredPrice: number; message?: string }) =>
    apiClient<PurchaseRequest>(`/farmers/purchase-requests/${id}/counter`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
