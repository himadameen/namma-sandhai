import { UserRole, Language } from '@prisma/client'
import prisma from '../config/database'
import { hashPassword, comparePassword } from '../utils/password'
import { signToken } from '../utils/jwt'
import { AppError } from '../middleware/errorHandler'
import type { RegisterInput, LoginInput, ChangePasswordInput } from '../validators/auth.validator'

const DEFAULT_DISTRICT = 'Chennai'
const DEFAULT_STATE = 'Tamil Nadu'

function sanitizeUser(user: {
  id: string
  email: string
  role: UserRole
  createdAt: Date
  name?: string | null
  phone?: string | null
  profileImageUrl?: string | null
  language?: Language | null
  adminRole?: { name: string } | null
  farmer?: {
    id: string
    name: string
    phone: string
    district: string
    state: string
    farmSize: string | null
    cropsGrown: string | null
    address: string | null
    isVerified: boolean
    language: Language
    profileImageUrl?: string | null
  } | null
  buyer?: {
    id: string
    name: string
    phone: string
    organization: string | null
    district: string
    state: string
    buyerType: string
    address: string | null
    isVerified: boolean
    language: Language
    profileImageUrl?: string | null
  } | null
}) {
  if (user.role === 'ADMIN') {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name?.trim() || user.email.split('@')[0],
      phone: user.phone ?? '',
      district: '',
      state: DEFAULT_STATE,
      isVerified: true,
      language: user.language ?? Language.en,
      profileImageUrl: user.profileImageUrl ?? null,
      adminRoleName: user.adminRole?.name ?? null,
      createdAt: user.createdAt,
    }
  }

  const profile = user.farmer ?? user.buyer
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: profile?.name ?? '',
    phone: profile?.phone ?? '',
    district: profile?.district ?? '',
    state: profile?.state ?? DEFAULT_STATE,
    isVerified: profile?.isVerified ?? false,
    language: profile?.language ?? Language.en,
    profileImageUrl: profile?.profileImageUrl ?? null,
    farmerId: user.farmer?.id,
    buyerId: user.buyer?.id,
    farmSize: user.farmer?.farmSize ?? null,
    cropsGrown: user.farmer?.cropsGrown ?? null,
    address: profile?.address ?? null,
    organization: user.buyer?.organization ?? null,
    buyerType: user.buyer?.buyerType ?? null,
    createdAt: user.createdAt,
  }
}

const userInclude = {
  farmer: true,
  buyer: true,
  adminRole: { select: { name: true } },
} as const

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new AppError(409, 'An account with this email already exists')
  }

  const hashedPassword = await hashPassword(input.password)
  const district = input.district || DEFAULT_DISTRICT
  const language = (input.language as Language) || (input.role === 'FARMER' ? Language.ta : Language.en)

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        role: input.role as UserRole,
        ...(input.role === 'FARMER'
          ? {
              farmer: {
                create: {
                  name: input.name,
                  phone: input.phone,
                  email: input.email,
                  district,
                  state: DEFAULT_STATE,
                  language,
                },
              },
            }
          : {
              buyer: {
                create: {
                  name: input.name,
                  phone: input.phone,
                  email: input.email,
                  organization: input.organization!,
                  district,
                  state: DEFAULT_STATE,
                  buyerType: input.buyerType ?? 'WHOLESALER',
                  language,
                },
              },
            }),
      },
      include: userInclude,
    })

    await tx.notification.create({
      data: {
        userId: created.id,
        title: 'Welcome to Namma Sandhai',
        message: 'Your account has been created successfully. Complete your profile to get started.',
        type: 'GENERAL',
      },
    })

    return created
  })

  const token = signToken({ userId: user.id, email: user.email, role: user.role })

  return {
    token,
    user: sanitizeUser(user),
  }
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: userInclude,
  })

  if (!user) {
    throw new AppError(401, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new AppError(403, 'Your account has been deactivated. Please contact support.')
  }

  const valid = await comparePassword(input.password, user.password)
  if (!valid) {
    throw new AppError(401, 'Invalid email or password')
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role })

  return {
    token,
    user: sanitizeUser(user),
  }
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  })

  if (!user) {
    throw new AppError(404, 'User not found')
  }

  return sanitizeUser(user)
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError(404, 'User not found')
  }

  const valid = await comparePassword(input.currentPassword, user.password)
  if (!valid) {
    throw new AppError(400, 'Current password is incorrect')
  }

  const hashedPassword = await hashPassword(input.newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { message: 'Password updated successfully' }
}
