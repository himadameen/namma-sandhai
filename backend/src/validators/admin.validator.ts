import { z } from 'zod'

export const verifyUserSchema = z.object({
  isVerified: z.boolean(),
})

export type VerifyUserInput = z.infer<typeof verifyUserSchema>
