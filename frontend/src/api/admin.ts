import { apiClient, API_BASE } from './client'

export type AdminPermission =
  | 'USERS_MANAGE'
  | 'KYC_REVIEW'
  | 'LISTINGS_MANAGE'
  | 'TRANSACTIONS_VIEW'
  | 'ENQUIRIES_MANAGE'
  | 'REPORTS_VIEW'
  | 'REPORTS_EXPORT'
  | 'ROLES_MANAGE'
  | 'ANALYTICS_VIEW'

export type EnquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type KycStatusSummary = 'NOT_STARTED' | 'INCOMPLETE' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface GrowthMetric {
  growthPercent: number | null
  direction: 'up' | 'down' | 'stable'
  label?: 'new' | 'no_activity' | 'change' | 'stable'
}

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
  inactiveUsers: number
  openEnquiries: number
  pendingKyc: number
  monthlyRevenue: number
  monthlyOrders: number
  revenueGrowth: GrowthMetric
}

export interface AdminDashboard {
  kpis: AdminDashboardKpis
  recentOrders: AdminRecentOrder[]
  charts: {
    userGrowth: { label: string; farmers: number; buyers: number }[]
    salesByMonth: { label: string; revenue: number; orders: number }[]
  }
}

export interface AdminRecentOrder {
  id: string
  status: string
  totalAmount: number
  updatedAt: string
  crop: { name: string; nameTamil: string }
  farmerName: string
  farmerNameTamil?: string | null
  buyerName: string
}

export interface AdminFarmer {
  id: string
  userId: string
  name: string
  nameTamil?: string | null
  email: string
  phone: string
  district: string
  isVerified: boolean
  isActive: boolean
  kycStatus: KycStatusSummary
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
  isActive: boolean
  kycStatus: KycStatusSummary
  ordersCount: number
  requestsCount: number
  createdAt: string
}

export interface AdminListing {
  id: string
  crop: { id: string; name: string; nameTamil: string; category: string; unit: string }
  farmer: { id: string; name: string; nameTamil?: string | null; district: string; isVerified: boolean; email: string }
  variety: string | null
  quantity: number
  unit: string
  expectedPrice: number
  district: string
  status: string
  createdAt: string
}

export interface AdminListingStock {
  yesterdayQuantity: number | null
  change: number | null
  changePercent: number | null
  direction: 'up' | 'down' | 'stable' | null
}

export interface AdminGroupedListingItem {
  id: string
  crop: { id: string; name: string; nameTamil: string; category: string; unit: string }
  variety: string | null
  quantity: number
  unit: string
  expectedPrice: number
  district: string
  status: string
  createdAt: string
  stock: AdminListingStock
}

export interface AdminFarmerListingGroup {
  farmer: {
    id: string
    name: string
    nameTamil?: string | null
    district: string
    isVerified: boolean
    email: string
    phone: string
  }
  stats: {
    productCount: number
    activeCount: number
    totalStock: number
    totalValue: number
  }
  listings: AdminGroupedListingItem[]
}

export interface AdminGroupedListingsResponse {
  summary: {
    farmerCount: number
    productCount: number
    totalStock: number
  }
  items: AdminFarmerListingGroup[]
  pagination: PaginationMeta
}

export interface AdminTransaction {
  id: string
  status: string
  quantity: number
  agreedPrice: number
  totalAmount: number
  deliveryType: string
  crop: { name: string; nameTamil: string; unit?: string }
  district: string
  farmerName: string
  farmerNameTamil?: string | null
  farmerDistrict: string
  buyerName: string
  buyerDistrict: string
  createdAt: string
  updatedAt: string
}

export interface AdminTransactionsResponse {
  items: AdminTransaction[]
  summary: {
    totalCount: number
    completedCount: number
    totalAmount: number
    completedAmount: number
  }
  pagination: PaginationMeta
}

export interface AdminEnquiry {
  id: string
  userId: string | null
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: EnquiryStatus
  adminReply: string | null
  adminNotes: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminEnquiriesResponse {
  items: AdminEnquiry[]
  summary: {
    open: number
    inProgress: number
    resolved: number
    closed: number
    total: number
  }
  pagination: PaginationMeta
}

export interface AdminKycDocument {
  id: string
  userId: string
  type: string
  fileUrl: string
  fileName: string
  status: string
  submittedAt: string
  userRole: string
  userName: string
  userNameTamil?: string | null
  district: string
  organization: string | null
}

export interface RankingEntry {
  rank: number
  medal: 'gold' | 'silver' | 'bronze' | null
  name: string
  nameTamil?: string | null
  district: string
  isVerified: boolean
  totalRevenue?: number
  totalSpend?: number
  growth: GrowthMetric
}

export interface TopSellingItem {
  rank: number
  cropId: string
  cropName: string
  cropNameTamil: string
  unit: string
  revenue: number
  quantity: number
  orderCount: number
}

export interface StockChangeItem {
  listingId: string
  crop: { name: string; nameTamil: string; unit: string }
  farmer: { name: string; nameTamil?: string | null; district: string }
  district: string
  currentQuantity: number
  yesterdayQuantity: number
  change: number
  changePercent: number
  direction: 'up' | 'down' | 'stable'
  unit: string
}

export interface StockChangesSummary {
  totalListings: number
  increased: number
  decreased: number
  unchanged: number
  netChange: number
}

export interface StockChangesResponse extends PaginatedResponse<StockChangeItem> {
  summary: StockChangesSummary
}

export interface AdminRole {
  id: string
  name: string
  description: string | null
  permissions: AdminPermission[]
  isSystem: boolean
  usersCount: number
  createdAt: string
}

export interface AdminUser {
  id: string
  email: string
  isActive: boolean
  role: { id: string; name: string; permissions: AdminPermission[] } | null
  createdAt: string
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  if (!entries.length) return ''
  return `?${entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')}`
}

async function downloadCsv(path: string, fallbackFilename: string) {
  const token = localStorage.getItem('namma-sandhai-token')
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error('Download failed')
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition')
  const filename = disposition?.match(/filename="(.+)"/)?.[1] ?? fallbackFilename
  return { blob, filename }
}

export const adminApi = {
  getDashboard: () => apiClient<AdminDashboard>('/admin/dashboard'),
  getAnalytics: () =>
    apiClient<{
      farmerRankings: RankingEntry[]
      buyerRankings: RankingEntry[]
      topSelling: { day: TopSellingItem[]; month: TopSellingItem[]; year: TopSellingItem[] }
      usageStats: {
        listingsByStatus: { status: string; count: number }[]
        ordersByStatus: { status: string; count: number }[]
        requestsByStatus: { status: string; count: number }[]
      }
    }>('/admin/analytics'),

  getFarmers: (params?: Record<string, string | number | undefined>) =>
    apiClient<PaginatedResponse<AdminFarmer>>(`/admin/farmers${buildQuery(params ?? {})}`),
  getBuyers: (params?: Record<string, string | number | undefined>) =>
    apiClient<PaginatedResponse<AdminBuyer>>(`/admin/buyers${buildQuery(params ?? {})}`),
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
  setUserStatus: (userId: string, isActive: boolean) =>
    apiClient<{ userId: string; isActive: boolean }>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  getPendingKyc: () => apiClient<AdminKycDocument[]>('/admin/kyc/pending'),
  getUserKyc: (userId: string) =>
    apiClient<{
      userId: string
      role: string
      name: string
      isVerified: boolean
      documents: { id: string; type: string; fileUrl: string; fileName: string; status: string }[]
    }>(`/admin/kyc/${userId}`),
  reviewKyc: (documentId: string, status: 'APPROVED' | 'REJECTED', reviewNote?: string) =>
    apiClient(`/admin/kyc/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNote }),
    }),

  getListings: (params?: Record<string, string | number | undefined>) =>
    apiClient<PaginatedResponse<AdminListing>>(`/admin/listings${buildQuery(params ?? {})}`),
  getListingsGrouped: (params?: Record<string, string | number | undefined>) =>
    apiClient<AdminGroupedListingsResponse>(`/admin/listings/grouped${buildQuery(params ?? {})}`),
  getTransactions: (params?: Record<string, string | number | undefined>) =>
    apiClient<AdminTransactionsResponse>(`/admin/transactions${buildQuery(params ?? {})}`),
  getEnquiries: (params?: Record<string, string | number | undefined>) =>
    apiClient<AdminEnquiriesResponse>(`/admin/enquiries${buildQuery(params ?? {})}`),
  updateEnquiry: (id: string, data: { status?: EnquiryStatus; adminReply?: string; adminNotes?: string }) =>
    apiClient<AdminEnquiry>(`/admin/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  createEnquiry: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    apiClient<AdminEnquiry>('/admin/enquiries', { method: 'POST', body: JSON.stringify(data) }),

  getStockChanges: (params?: Record<string, string | number | undefined>) =>
    apiClient<StockChangesResponse>(`/admin/stock-changes${buildQuery(params ?? {})}`),

  getRoles: () => apiClient<AdminRole[]>('/admin/roles'),
  getPermissions: () => apiClient<AdminPermission[]>('/admin/roles/permissions'),
  createRole: (data: { name: string; description?: string; permissions: AdminPermission[] }) =>
    apiClient<AdminRole>('/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: Partial<{ name: string; description: string; permissions: AdminPermission[] }>) =>
    apiClient<AdminRole>(`/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRole: (id: string) => apiClient(`/admin/roles/${id}`, { method: 'DELETE' }),
  getAdminUsers: () => apiClient<AdminUser[]>('/admin/admins'),
  assignRole: (userId: string, adminRoleId: string | null) =>
    apiClient(`/admin/admins/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ adminRoleId }),
    }),

  exportTransactions: (params?: Record<string, string | number | undefined>) =>
    downloadCsv(`/admin/reports/transactions/export${buildQuery(params ?? {})}`, 'transactions.csv'),
  exportRevenue: () => downloadCsv('/admin/reports/revenue/export', 'revenue.csv'),
  exportUsers: () => downloadCsv('/admin/reports/users/export', 'users.csv'),
  exportListings: (params?: Record<string, string | number | undefined>) =>
    downloadCsv(`/admin/reports/listings/export${buildQuery(params ?? {})}`, 'listings.csv'),
}

export function triggerCsvDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
