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
  sharePercent: number
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

export interface WeeklySalesPoint {
  week: string
  weekKey: string
  revenue: number
}

export interface OrdersByStatus {
  pending: number
  confirmed: number
  inTransit: number
  completed: number
  cancelled: number
}

export interface FarmerDashboard {
  kpis: FarmerDashboardKpis
  monthlySales: MonthlySalesPoint[]
  weeklySales: WeeklySalesPoint[]
  salesByCrop: SalesByCrop[]
  ordersByStatus: OrdersByStatus
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

export interface SalesCropAggregate {
  cropId: string
  cropName: string
  cropNameTamil: string
  revenue: number
  quantity: number
  count: number
}

export interface SalesMonthlyPoint {
  monthKey: string
  revenue: number
  quantity: number
  count: number
}

export interface SalesYearlyPoint {
  year: number
  revenue: number
  quantity: number
  count: number
}

export interface SalesRecordsResponse {
  records: SalesRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    totalRecords: number
    totalRevenue: number
    totalQuantity: number
    avgOrderValue: number
    currentMonthRevenue: number
    previousMonthRevenue: number
    currentYearRevenue: number
  }
  periodReport: {
    year: number | null
    month: number | null
    revenue: number
    quantity: number
    transactionCount: number
    previousRevenue: number
    changePercent: number | null
    direction: 'up' | 'down' | 'stable'
    comparisonType: 'previous_month' | 'previous_year' | 'all_time'
  }
  insights: {
    monthOverMonthPercent: number | null
    monthOverMonthDirection: 'up' | 'down' | 'stable'
    currentMonthKey: string
    previousMonthKey: string
    bestMonthKey: string | null
    bestMonthRevenue: number
    bestYear: number | null
    bestYearRevenue: number
  }
  availableYears: number[]
  yearlyRevenue: SalesYearlyPoint[]
  monthlyRevenue: SalesMonthlyPoint[]
  topCropsOverall: SalesCropAggregate[]
  topCropsForPeriod: SalesCropAggregate[]
  topCropsThisMonth: SalesCropAggregate[]
  topCropsLastMonth: SalesCropAggregate[]
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const dashboardApi = {
  getFarmerDashboard: () => apiClient<FarmerDashboard>('/farmers/dashboard'),
  getBuyerDashboard: () => apiClient<BuyerDashboard>('/buyers/dashboard'),
  getFarmerSalesRecords: (params?: {
    page?: number
    limit?: number
    cropId?: string
    year?: number
    month?: number
    search?: string
  }) => apiClient<SalesRecordsResponse>(`/farmers/sales-records${buildQuery(params ?? {})}`),
  exportFarmerSalesCsv: async (params?: { year?: number; month?: number }) => {
    const token = localStorage.getItem('namma-sandhai-token')
    const response = await fetch(
      `${API_BASE}/farmers/sales-records/export${buildQuery(params ?? {})}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
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
