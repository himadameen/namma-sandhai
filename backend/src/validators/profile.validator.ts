import { z } from 'zod'

export const TN_DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Erode',
  'Tiruchirappalli',
  'Thanjavur',
  'Tiruppur',
  'Dindigul',
  'Krishnagiri',
  'Dharmapuri',
  'Vellore',
  'Tiruvannamalai',
  'Cuddalore',
  'Villupuram',
  'Namakkal',
  'Karur',
] as const

export const updateFarmerProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  district: z.enum(TN_DISTRICTS),
  state: z.string().min(2).optional(),
  farmSize: z.string().optional(),
  cropsGrown: z.string().optional(),
  address: z.string().optional(),
  language: z.enum(['en', 'ta']).optional(),
})

export const updateBuyerProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  organization: z.string().min(2, 'Organization is required'),
  district: z.enum(TN_DISTRICTS),
  state: z.string().min(2).optional(),
  buyerType: z.enum(['WHOLESALER', 'RETAILER', 'PROCESSOR', 'RESTAURANT', 'OTHER']),
  address: z.string().optional(),
  language: z.enum(['en', 'ta']).optional(),
})

export type UpdateFarmerProfileInput = z.infer<typeof updateFarmerProfileSchema>
export type UpdateBuyerProfileInput = z.infer<typeof updateBuyerProfileSchema>

export const updateAdminProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.replace(/\D/g, '').length >= 10, 'Valid phone number is required'),
  language: z.enum(['en', 'ta']).optional(),
})

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>

export const uploadKycDocumentSchema = z.object({
  type: z.enum(['GOVT_ID', 'LAND_RECORD', 'BANK_PROOF', 'GST_CERT']),
})

export type UploadKycDocumentInput = z.infer<typeof uploadKycDocumentSchema>
