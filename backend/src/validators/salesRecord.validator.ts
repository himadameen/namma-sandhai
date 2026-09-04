import { z } from 'zod'

export const farmerSalesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  cropId: z.string().optional(),
  year: z.coerce.number().optional(),
  search: z.string().optional(),
})

export type FarmerSalesQuery = z.infer<typeof farmerSalesQuerySchema>
