import { z } from 'zod'
import { TN_DISTRICTS } from './profile.validator'

export const marketPriceQuerySchema = z.object({
  crop: z.string().min(1).optional(),
  cropId: z.string().optional(),
  district: z.enum(TN_DISTRICTS).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export const marketTrendQuerySchema = z.object({
  crop: z.string().min(1).optional(),
  cropId: z.string().optional(),
  district: z.enum(TN_DISTRICTS),
  days: z.coerce.number().min(1).max(30).optional().default(7),
})

export type MarketPriceQuery = z.infer<typeof marketPriceQuerySchema>
export type MarketTrendQuery = z.infer<typeof marketTrendQuerySchema>
