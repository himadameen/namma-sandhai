import { apiClient, API_BASE } from './client'
import type { Crop } from './market'

export interface FarmerDashboardKpis {
  activeListings: number
  pendingRequests: number
  activeOrders: number
  totalRevenue: number
  totalSalesCount: number
  totalQuantitySold: number
}

export interface MonthlySalesPoint {
  month: string
  monthKey: string
  revenue: number
  quantity: number
}

export interface SalesByCrop {
  cropId: string
  cropName: string
  cropNameTamil: string
  revenue: number
  quantity: number
  count: number
}

export interface SalesRecord {
  id: string
  buyerName: string
  quantity: number
  unit: string
  price: number
  totalAmount: number
  soldAt: string
  crop: Crop
}

export interface FarmerDashboard {
  kpis: FarmerDashboardKpis
  monthlySales: MonthlySalesPoint[]
  salesByCrop: SalesByCrop[]
  recentSales: SalesRecord[]
}

export interface BuyerDashboardKpis {
  pendingRequests: number
  activeOrders: number
  completedOrders: number
  totalSpent: number
}

export interface BuyerDashboardOrder {
  id: string
  quantity: number
  totalAmount: number
  status: string
  updatedAt: string
  crop: Crop
  farmer: { id: string; name: string; district: string; isVerified: boolean }
}

export interface BuyerDashboard {
  kpis: BuyerDashboardKpis
  recentOrders: BuyerDashboardOrder[]
}

export interface SalesRecordsResponse {
  records: SalesRecord[]
  summary: {
    totalRecords: number
    totalRevenue: number
    totalQuantity: number
  }
}

export const dashboardApi = {
  getFarmerDashboard: () => apiClient<FarmerDashboard>('/farmers/dashboard'),
  getBuyerDashboard: () => apiClient<BuyerDashboard>('/buyers/dashboard'),
  getFarmerSalesRecords: () => apiClient<SalesRecordsResponse>('/farmers/sales-records'),
  exportFarmerSalesCsv: async () => {
    const token = localStorage.getItem('namma-sandhai-token')
    const response = await fetch(`${API_BASE}/farmers/sales-records/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Export failed')
    }
    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition')
    const filename =
      disposition?.match(/filename="(.+)"/)?.[1] ?? 'namma-sandhai-sales.csv'
    return { blob, filename }
  },
}
