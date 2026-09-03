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

export type OrderStatusUpdate = 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'

export const ordersApi = {
  getFarmerOrders: () => apiClient<Order[]>('/farmers/orders'),

  getBuyerOrders: () => apiClient<Order[]>('/buyers/orders'),

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
