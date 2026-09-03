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

export interface CreatePurchaseRequestPayload {
  listingId: string
  quantity: number
  offeredPrice: number
  deliveryType: DeliveryType
  message?: string
}

export const purchaseRequestsApi = {
  create: (data: CreatePurchaseRequestPayload) =>
    apiClient<PurchaseRequest>('/buyers/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBuyerRequests: () => apiClient<PurchaseRequest[]>('/buyers/purchase-requests'),

  getFarmerRequests: () => apiClient<PurchaseRequest[]>('/farmers/purchase-requests'),

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
