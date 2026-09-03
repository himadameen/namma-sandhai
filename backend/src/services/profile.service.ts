import { Language } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type {
  UpdateFarmerProfileInput,
  UpdateBuyerProfileInput,
} from '../validators/profile.validator'

export function formatFarmerProfile(farmer: {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  district: string
  state: string
  farmSize: string | null
  cropsGrown: string | null
  address: string | null
  language: Language
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: farmer.id,
    userId: farmer.userId,
    name: farmer.name,
    phone: farmer.phone,
    email: farmer.email,
    district: farmer.district,
    state: farmer.state,
    farmSize: farmer.farmSize,
    cropsGrown: farmer.cropsGrown,
    address: farmer.address,
    language: farmer.language,
    isVerified: farmer.isVerified,
    createdAt: farmer.createdAt,
    updatedAt: farmer.updatedAt,
  }
}

export function formatBuyerProfile(buyer: {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  organization: string | null
  district: string
  state: string
  buyerType: string
  address: string | null
  language: Language
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: buyer.id,
    userId: buyer.userId,
    name: buyer.name,
    phone: buyer.phone,
    email: buyer.email,
    organization: buyer.organization,
    district: buyer.district,
    state: buyer.state,
    buyerType: buyer.buyerType,
    address: buyer.address,
    language: buyer.language,
    isVerified: buyer.isVerified,
    createdAt: buyer.createdAt,
    updatedAt: buyer.updatedAt,
  }
}

export async function getFarmerProfile(userId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) {
    throw new AppError(404, 'Farmer profile not found')
  }
  return formatFarmerProfile(farmer)
}

export async function updateFarmerProfile(userId: string, input: UpdateFarmerProfileInput) {
  const existing = await prisma.farmer.findUnique({ where: { userId } })
  if (!existing) {
    throw new AppError(404, 'Farmer profile not found')
  }

  const farmer = await prisma.farmer.update({
    where: { userId },
    data: {
      name: input.name,
      phone: input.phone,
      district: input.district,
      state: input.state ?? existing.state,
      farmSize: input.farmSize ?? null,
      cropsGrown: input.cropsGrown ?? null,
      address: input.address ?? null,
      language: (input.language as Language) ?? existing.language,
    },
  })

  return formatFarmerProfile(farmer)
}

export async function getBuyerProfile(userId: string) {
  const buyer = await prisma.buyer.findUnique({ where: { userId } })
  if (!buyer) {
    throw new AppError(404, 'Buyer profile not found')
  }
  return formatBuyerProfile(buyer)
}

export async function updateBuyerProfile(userId: string, input: UpdateBuyerProfileInput) {
  const existing = await prisma.buyer.findUnique({ where: { userId } })
  if (!existing) {
    throw new AppError(404, 'Buyer profile not found')
  }

  const buyer = await prisma.buyer.update({
    where: { userId },
    data: {
      name: input.name,
      phone: input.phone,
      organization: input.organization,
      district: input.district,
      state: input.state ?? existing.state,
      buyerType: input.buyerType,
      address: input.address ?? null,
      language: (input.language as Language) ?? existing.language,
    },
  })

  return formatBuyerProfile(buyer)
}
