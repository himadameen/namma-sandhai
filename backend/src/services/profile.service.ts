import { DocumentType, Language, UserRole } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type {
  UpdateFarmerProfileInput,
  UpdateBuyerProfileInput,
  UploadKycDocumentInput,
} from '../validators/profile.validator'

const FARMER_REQUIRED_DOCS: DocumentType[] = ['GOVT_ID', 'LAND_RECORD', 'BANK_PROOF']
const BUYER_REQUIRED_DOCS: DocumentType[] = ['GOVT_ID', 'BANK_PROOF', 'GST_CERT']

export type KycStatus = 'NOT_STARTED' | 'INCOMPLETE' | 'SUBMITTED' | 'VERIFIED'

function requiredDocsForRole(role: UserRole) {
  return role === 'FARMER' ? FARMER_REQUIRED_DOCS : BUYER_REQUIRED_DOCS
}

function computeKycStatus(
  role: UserRole,
  isVerified: boolean,
  documents: { type: DocumentType }[]
): KycStatus {
  if (isVerified) return 'VERIFIED'

  const required = requiredDocsForRole(role)
  const uploaded = new Set(documents.map((doc) => doc.type))

  if (uploaded.size === 0) return 'NOT_STARTED'
  if (required.every((type) => uploaded.has(type))) return 'SUBMITTED'
  return 'INCOMPLETE'
}

function formatDocument(doc: {
  id: string
  type: DocumentType
  fileUrl: string
  fileName: string
  status: string
  submittedAt: Date
  updatedAt: Date
}) {
  return {
    id: doc.id,
    type: doc.type,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    status: doc.status,
    submittedAt: doc.submittedAt,
    updatedAt: doc.updatedAt,
  }
}

async function getUserDocuments(userId: string) {
  return prisma.profileDocument.findMany({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
  })
}

function buildKycSummary(role: UserRole, isVerified: boolean, documents: { type: DocumentType }[]) {
  const required = requiredDocsForRole(role)
  const uploadedTypes = new Set(documents.map((doc) => doc.type))

  return {
    status: computeKycStatus(role, isVerified, documents),
    requiredDocuments: required.map((type) => ({
      type,
      uploaded: uploadedTypes.has(type),
    })),
    uploadedCount: uploadedTypes.size,
    requiredCount: required.length,
  }
}

export function formatFarmerProfile(
  farmer: {
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
    profileImageUrl: string | null
    createdAt: Date
    updatedAt: Date
  },
  documents: Awaited<ReturnType<typeof getUserDocuments>>
) {
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
    profileImageUrl: farmer.profileImageUrl,
    createdAt: farmer.createdAt,
    updatedAt: farmer.updatedAt,
    documents: documents.map(formatDocument),
    kyc: buildKycSummary('FARMER', farmer.isVerified, documents),
  }
}

export function formatBuyerProfile(
  buyer: {
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
    profileImageUrl: string | null
    createdAt: Date
    updatedAt: Date
  },
  documents: Awaited<ReturnType<typeof getUserDocuments>>
) {
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
    profileImageUrl: buyer.profileImageUrl,
    createdAt: buyer.createdAt,
    updatedAt: buyer.updatedAt,
    documents: documents.map(formatDocument),
    kyc: buildKycSummary('BUYER', buyer.isVerified, documents),
  }
}

export async function getFarmerProfile(userId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) {
    throw new AppError(404, 'Farmer profile not found')
  }
  const documents = await getUserDocuments(userId)
  return formatFarmerProfile(farmer, documents)
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

  const documents = await getUserDocuments(userId)
  return formatFarmerProfile(farmer, documents)
}

export async function getBuyerProfile(userId: string) {
  const buyer = await prisma.buyer.findUnique({ where: { userId } })
  if (!buyer) {
    throw new AppError(404, 'Buyer profile not found')
  }
  const documents = await getUserDocuments(userId)
  return formatBuyerProfile(buyer, documents)
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

  const documents = await getUserDocuments(userId)
  return formatBuyerProfile(buyer, documents)
}

export async function uploadFarmerProfileImage(userId: string, filename: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) throw new AppError(404, 'Farmer profile not found')

  const updated = await prisma.farmer.update({
    where: { userId },
    data: { profileImageUrl: `/uploads/profiles/${filename}` },
  })

  const documents = await getUserDocuments(userId)
  return formatFarmerProfile(updated, documents)
}

export async function uploadBuyerProfileImage(userId: string, filename: string) {
  const buyer = await prisma.buyer.findUnique({ where: { userId } })
  if (!buyer) throw new AppError(404, 'Buyer profile not found')

  const updated = await prisma.buyer.update({
    where: { userId },
    data: { profileImageUrl: `/uploads/profiles/${filename}` },
  })

  const documents = await getUserDocuments(userId)
  return formatBuyerProfile(updated, documents)
}

function assertDocumentAllowedForRole(role: UserRole, type: DocumentType) {
  const allowed = requiredDocsForRole(role)
  if (!allowed.includes(type)) {
    throw new AppError(400, 'This document type is not required for your account')
  }
}

export async function uploadKycDocument(
  userId: string,
  role: UserRole,
  input: UploadKycDocumentInput,
  filename: string,
  originalName: string
) {
  assertDocumentAllowedForRole(role, input.type)

  const fileUrl = `/uploads/kyc/${filename}`

  await prisma.profileDocument.upsert({
    where: {
      userId_type: {
        userId,
        type: input.type,
      },
    },
    create: {
      userId,
      type: input.type,
      fileUrl,
      fileName: originalName,
      status: 'PENDING',
    },
    update: {
      fileUrl,
      fileName: originalName,
      status: 'PENDING',
      submittedAt: new Date(),
    },
  })

  if (role === 'FARMER') {
    return getFarmerProfile(userId)
  }
  return getBuyerProfile(userId)
}
