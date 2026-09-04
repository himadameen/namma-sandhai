import { z } from 'zod'

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']),
})

export const farmerOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  status: z
    .enum(['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
    .optional(),
  cropId: z.string().optional(),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']).optional(),
  search: z.string().optional(),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type FarmerOrdersQuery = z.infer<typeof farmerOrdersQuerySchema>
