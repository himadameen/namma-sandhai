import { z } from 'zod'
import { TN_DISTRICTS } from './profile.validator'

export const listingMediaItemSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  type: z.enum(['image', 'video']),
  name: z.string().optional(),
})

export type ListingMediaInput = z.infer<typeof listingMediaItemSchema>

export const farmerListingsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  status: z.enum(['ACTIVE', 'SOLD', 'EXPIRED']).optional(),
  search: z.string().optional(),
})

export type FarmerListingsQuery = z.infer<typeof farmerListingsQuerySchema>

export const marketplaceQuerySchema = z.object({
  search: z.string().optional(),
  crop: z.string().optional(),
  cropId: z.string().optional(),
  district: z.enum(TN_DISTRICTS).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minQuantity: z.coerce.number().optional(),
  available: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

export const createListingSchema = z.object({
  cropId: z.string().min(1),
  variety: z.string().optional(),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1).optional(),
  expectedPrice: z.coerce.number().positive('Price must be greater than 0'),
  district: z.enum(TN_DISTRICTS).optional(),
  state: z.string().optional(),
  harvestDate: z.string().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  media: z.array(listingMediaItemSchema).max(8).optional(),
})

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['ACTIVE', 'SOLD', 'EXPIRED']).optional(),
})

export type MarketplaceQuery = z.infer<typeof marketplaceQuerySchema>
export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
