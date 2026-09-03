import { apiClient } from './client'

export interface AdminDashboardKpis {
  totalUsers: number
  farmers: number
  buyers: number
  verifiedFarmers: number
  verifiedBuyers: number
  activeListings: number
  totalOrders: number
  completedOrders: number
  totalSalesVolume: number
  salesCount: number
  pendingVerifications: number
}

export interface AdminRecentOrder {
  id: string
  status: string
  totalAmount: number
  updatedAt: string
  crop: { name: string; nameTamil: string }
  farmerName: string
  buyerName: string
}

export interface AdminDashboard {
  kpis: AdminDashboardKpis
  recentOrders: AdminRecentOrder[]
}

export interface AdminFarmer {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  district: string
  isVerified: boolean
  listingsCount: number
  ordersCount: number
  createdAt: string
}

export interface AdminBuyer {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  organization: string | null
  district: string
  buyerType: string
  isVerified: boolean
  ordersCount: number
  requestsCount: number
  createdAt: string
}

export const adminApi = {
  getDashboard: () => apiClient<AdminDashboard>('/admin/dashboard'),
  getFarmers: () => apiClient<AdminFarmer[]>('/admin/farmers'),
  getBuyers: () => apiClient<AdminBuyer[]>('/admin/buyers'),
  verifyFarmer: (id: string, isVerified: boolean) =>
    apiClient<{ id: string; isVerified: boolean }>(`/admin/farmers/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    }),
  verifyBuyer: (id: string, isVerified: boolean) =>
    apiClient<{ id: string; isVerified: boolean }>(`/admin/buyers/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    }),
}
