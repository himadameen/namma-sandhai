import { z } from 'zod'

export const farmerSalesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  cropId: z.string().optional(),
  year: z.coerce.number().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  search: z.string().optional(),
})

export const farmerSalesExportQuerySchema = z.object({
  year: z.coerce.number().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
})

export type FarmerSalesQuery = z.infer<typeof farmerSalesQuerySchema>
export type FarmerSalesExportQuery = z.infer<typeof farmerSalesExportQuerySchema>
