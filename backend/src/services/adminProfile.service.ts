import { Language } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type { UpdateAdminProfileInput } from '../validators/profile.validator'

export function formatAdminProfile(user: {
  id: string
  email: string
  name: string | null
  phone: string | null
  profileImageUrl: string | null
  language: Language
  createdAt: Date
  updatedAt: Date
  adminRole?: { name: string } | null
}) {
  return {
    id: user.id,
    userId: user.id,
    name: user.name?.trim() || user.email.split('@')[0],
    phone: user.phone ?? '',
    email: user.email,
    language: user.language,
    profileImageUrl: user.profileImageUrl,
    adminRoleName: user.adminRole?.name ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function getAdminUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { adminRole: { select: { name: true } } },
  })

  if (!user || user.role !== 'ADMIN') {
    throw new AppError(404, 'Admin profile not found')
  }

  return user
}

export async function getAdminProfile(userId: string) {
  const user = await getAdminUser(userId)
  return formatAdminProfile(user)
}

export async function updateAdminProfile(userId: string, input: UpdateAdminProfileInput) {
  const existing = await getAdminUser(userId)

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      language: (input.language as Language) ?? existing.language,
    },
    include: { adminRole: { select: { name: true } } },
  })

  return formatAdminProfile(user)
}

export async function uploadAdminProfileImage(userId: string, filename: string) {
  await getAdminUser(userId)

  const user = await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: `/uploads/profiles/${filename}` },
    include: { adminRole: { select: { name: true } } },
  })

  return formatAdminProfile(user)
}
