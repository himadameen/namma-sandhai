import { apiClient } from './client'

export interface Crop {
  id: string
  name: string
  nameTamil: string
  category: string
  unit: string
}

export interface MarketPriceRecord {
  id: string
  cropId: string
  district: string
  marketName: string
  date: string
  minPrice: number
  maxPrice: number
  averagePrice: number
  unit: string
  crop: Crop
}

export interface MarketPriceSummary {
  date: string
  minPrice: number
  maxPrice: number
  averagePrice: number
  unit: string
  crop: Crop
  district: string
  recordCount: number
}

export interface TrendPoint {
  date: string
  minPrice: number
  maxPrice: number
  averagePrice: number
  unit: string
}

export interface MarketTrend {
  crop: Crop
  district: string
  trend: TrendPoint[]
  summary: {
    minPrice: number
    maxPrice: number
    averagePrice: number
    unit: string
    date: string
  } | null
  insight: {
    todayAverage: number
    previousPeriodAverage: number
    percentChange: number | null
    direction: 'higher' | 'lower' | 'stable' | null
  } | null
  listingComparison: {
    listingPrice: number
    marketAverage: number
    difference: number
    percentVsMarket: number
  } | null
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const marketApi = {
  getCrops: () => apiClient<Crop[]>('/crops'),

  getMarketPrices: (params: {
    crop?: string
    cropId?: string
    district?: string
    dateFrom?: string
    dateTo?: string
  }) =>
    apiClient<{ prices: MarketPriceRecord[]; summary: MarketPriceSummary | null }>(
      `/market-prices${buildQuery(params)}`
    ),

  getTrend: (params: { crop?: string; cropId?: string; district: string; days?: number }) =>
    apiClient<MarketTrend>(`/market-prices/trend${buildQuery(params)}`),
}
