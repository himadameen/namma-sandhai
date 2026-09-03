import { z } from 'zod'

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
