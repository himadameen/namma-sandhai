import { apiClient } from './client'
import type { Crop } from './market'

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED'

export type DeliveryType = 'PICKUP' | 'DELIVERY'

export interface OrderTimelineStep {
  status: OrderStatus
  label: string
  completed: boolean
  current: boolean
}

export interface Order {
  id: string
  quantity: number
  agreedPrice: number
  totalAmount: number
  deliveryType: DeliveryType
  status: OrderStatus
  createdAt: string
  updatedAt: string
  timeline: OrderTimelineStep[]
  buyer: {
    id: string
    name: string
    organization: string | null
    district: string
  }
  farmer: {
    id: string
    name: string
    district: string
    isVerified: boolean
  }
  listing: {
    id: string
    variety: string | null
    district: string
    unit: string
    imageUrl: string | null
    crop: Crop
  }
  salesRecord: { id: string; soldAt: string } | null
}

export interface FarmerOrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    total: number
    active: number
    pendingConfirmation: number
    confirmed: number
    inTransit: number
    completed: number
    cancelled: number
  }
}

export type BuyerOrdersResponse = FarmerOrdersResponse

export type OrderStatusUpdate = 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const ordersApi = {
  getFarmerOrders: (params?: {
    page?: number
    limit?: number
    status?: OrderStatus
    cropId?: string
    deliveryType?: DeliveryType
    search?: string
  }) => apiClient<FarmerOrdersResponse>(`/farmers/orders${buildQuery(params ?? {})}`),

  getBuyerOrders: (params?: {
    page?: number
    limit?: number
    status?: OrderStatus
    cropId?: string
    deliveryType?: DeliveryType
    search?: string
  }) => apiClient<BuyerOrdersResponse>(`/buyers/orders${buildQuery(params ?? {})}`),

  updateFarmerOrderStatus: (id: string, status: OrderStatusUpdate) =>
    apiClient<Order>(`/farmers/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateBuyerOrderStatus: (id: string, status: OrderStatusUpdate) =>
    apiClient<Order>(`/buyers/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}
