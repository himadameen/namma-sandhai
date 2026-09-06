import { z } from 'zod'

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['FARMER', 'BUYER']),
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    district: z.string().min(2).optional(),
    organization: z.string().optional(),
    buyerType: z
      .enum(['WHOLESALER', 'RETAILER', 'PROCESSOR', 'RESTAURANT', 'OTHER'])
      .optional(),
    language: z.enum(['en', 'ta']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'BUYER' && !data.organization) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization is required for buyers',
        path: ['organization'],
      })
    }
  })

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
