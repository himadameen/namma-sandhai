import { z } from 'zod'
import { AdminPermission, DocumentStatus, EnquiryStatus, ListingStatus, OrderStatus } from '@prisma/client'

export const verifyUserSchema = z.object({
  isVerified: z.boolean(),
})

export const userStatusSchema = z.object({
  isActive: z.boolean(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const farmersQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  district: z.string().optional(),
  verified: z.enum(['true', 'false']).optional(),
  active: z.enum(['true', 'false']).optional(),
})

export const buyersQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  district: z.string().optional(),
  verified: z.enum(['true', 'false']).optional(),
  active: z.enum(['true', 'false']).optional(),
})

export const listingsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  district: z.string().optional(),
  crop: z.string().optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  farmerId: z.string().optional(),
})

export const stockChangesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  district: z.string().optional(),
  direction: z.enum(['up', 'down', 'stable']).optional(),
})

export const transactionsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  district: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export const enquiriesQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(EnquiryStatus).optional(),
  search: z.string().optional(),
})

export const createEnquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
})

export const updateEnquirySchema = z.object({
  status: z.nativeEnum(EnquiryStatus).optional(),
  adminReply: z.string().max(2000).optional(),
  adminNotes: z.string().max(2000).optional(),
})

export const kycReviewSchema = z.object({
  status: z.enum([DocumentStatus.APPROVED, DocumentStatus.REJECTED]),
  reviewNote: z.string().max(500).optional(),
})

export const createRoleSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(200).optional(),
  permissions: z.array(z.nativeEnum(AdminPermission)).min(1),
})

export const updateRoleSchema = createRoleSchema.partial()

export const assignRoleSchema = z.object({
  adminRoleId: z.string().nullable(),
})

export const topSellingPeriodSchema = z.object({
  period: z.enum(['day', 'month', 'year']).default('month'),
})

export type VerifyUserInput = z.infer<typeof verifyUserSchema>
export type FarmersQuery = z.infer<typeof farmersQuerySchema>
export type BuyersQuery = z.infer<typeof buyersQuerySchema>
export type ListingsQuery = z.infer<typeof listingsQuerySchema>
export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>
export type EnquiriesQuery = z.infer<typeof enquiriesQuerySchema>
