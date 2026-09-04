import { z } from 'zod'

export const createPurchaseRequestSchema = z.object({
  listingId: z.string().min(1),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  offeredPrice: z.coerce.number().positive('Price must be greater than 0'),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']),
  message: z.string().optional(),
})

export const counterOfferSchema = z.object({
  offeredPrice: z.coerce.number().positive('Counter price must be greater than 0'),
  message: z.string().optional(),
})

export const farmerPurchaseRequestsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED']).optional(),
  cropId: z.string().optional(),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']).optional(),
  search: z.string().optional(),
})

export type CreatePurchaseRequestInput = z.infer<typeof createPurchaseRequestSchema>
export type CounterOfferInput = z.infer<typeof counterOfferSchema>
export type FarmerPurchaseRequestsQuery = z.infer<typeof farmerPurchaseRequestsQuerySchema>
