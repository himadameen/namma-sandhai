import { ListingStatus, Prisma } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type {
  CreateListingInput,
  FarmerListingsQuery,
  ListingMediaInput,
  MarketplaceQuery,
  UpdateListingInput,
} from '../validators/listing.validator'
import { normalizeMediaInput, parseListingMedia, primaryImageUrl } from '../utils/listingMedia'

function parseOptionalDate(value?: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) throw new AppError(400, 'Invalid date format')
  return d
}

function formatListing(listing: {
  id: string
  variety: string | null
  quantity: number
  unit: string
  expectedPrice: number
  district: string
  state: string
  harvestDate: Date | null
  availableFrom: Date | null
  availableUntil: Date | null
  description: string | null
  imageUrl: string | null
  media: unknown
  status: ListingStatus
  createdAt: Date
  updatedAt: Date
  crop: { id: string; name: string; nameTamil: string; category: string; unit: string }
  farmer: { id: string; name: string; isVerified: boolean; district: string }
}) {
  const media = parseListingMedia(listing.media, listing.imageUrl)

  return {
    id: listing.id,
    variety: listing.variety,
    quantity: listing.quantity,
    unit: listing.unit,
    expectedPrice: listing.expectedPrice,
    district: listing.district,
    state: listing.state,
    harvestDate: listing.harvestDate,
    availableFrom: listing.availableFrom,
    availableUntil: listing.availableUntil,
    description: listing.description,
    imageUrl: primaryImageUrl(media, listing.imageUrl),
    media,
    status: listing.status,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    crop: listing.crop,
    farmer: {
      id: listing.farmer.id,
      name: listing.farmer.name,
      isVerified: listing.farmer.isVerified,
      district: listing.farmer.district,
    },
  }
}

async function getLatestMarketAverage(cropId: string, district: string) {
  const latest = await prisma.marketPrice.findFirst({
    where: { cropId, district },
    orderBy: { date: 'desc' },
  })
  return latest
    ? { averagePrice: latest.averagePrice, minPrice: latest.minPrice, maxPrice: latest.maxPrice, unit: latest.unit }
    : null
}

export async function getMarketplaceListings(query: MarketplaceQuery) {
  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.ACTIVE,
  }

  if (query.cropId) where.cropId = query.cropId
  if (query.district) where.district = query.district
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.expectedPrice = {}
    if (query.minPrice !== undefined) where.expectedPrice.gte = query.minPrice
    if (query.maxPrice !== undefined) where.expectedPrice.lte = query.maxPrice
  }
  if (query.minQuantity !== undefined) where.quantity = { gte: query.minQuantity }

  if (query.available) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    where.AND = [
      { OR: [{ availableFrom: null }, { availableFrom: { lte: today } }] },
      { OR: [{ availableUntil: null }, { availableUntil: { gte: today } }] },
    ]
  }

  if (query.search || query.crop) {
    const term = query.search ?? query.crop ?? ''
    where.crop = {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { nameTamil: { contains: term, mode: 'insensitive' } },
      ],
    }
  }

  const skip = (query.page - 1) * query.limit

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        crop: { select: { id: true, name: true, nameTamil: true, category: true, unit: true } },
        farmer: { select: { id: true, name: true, isVerified: true, district: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.listing.count({ where }),
  ])

  return {
    listings: listings.map(formatListing),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      crop: { select: { id: true, name: true, nameTamil: true, category: true, unit: true } },
      farmer: { select: { id: true, name: true, isVerified: true, district: true, phone: true } },
    },
  })

  if (!listing) throw new AppError(404, 'Listing not found')

  const marketAverage = await getLatestMarketAverage(listing.cropId, listing.district)

  return {
    ...formatListing(listing),
    farmer: listing.farmer,
    marketAverage,
  }
}

async function getFarmerByUserId(userId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) throw new AppError(404, 'Farmer profile not found')
  return farmer
}

export async function getFarmerListings(userId: string, query: FarmerListingsQuery) {
  const farmer = await getFarmerByUserId(userId)

  const where: Prisma.ListingWhereInput = { farmerId: farmer.id }

  if (query.status) {
    where.status = query.status
  }

  if (query.search) {
    where.OR = [
      { crop: { name: { contains: query.search, mode: 'insensitive' } } },
      { crop: { nameTamil: { contains: query.search, mode: 'insensitive' } } },
      { variety: { contains: query.search, mode: 'insensitive' } },
      { district: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const skip = (query.page - 1) * query.limit

  const [listings, total, activeCount, soldCount, expiredCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        crop: { select: { id: true, name: true, nameTamil: true, category: true, unit: true } },
        farmer: { select: { id: true, name: true, isVerified: true, district: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.listing.count({ where }),
    prisma.listing.count({ where: { farmerId: farmer.id, status: ListingStatus.ACTIVE } }),
    prisma.listing.count({ where: { farmerId: farmer.id, status: ListingStatus.SOLD } }),
    prisma.listing.count({ where: { farmerId: farmer.id, status: ListingStatus.EXPIRED } }),
  ])

  return {
    listings: listings.map(formatListing),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
    summary: {
      total: activeCount + soldCount + expiredCount,
      active: activeCount,
      sold: soldCount,
      expired: expiredCount,
    },
  }
}

export async function createListing(userId: string, input: CreateListingInput) {
  const farmer = await getFarmerByUserId(userId)
  const crop = await prisma.crop.findUnique({ where: { id: input.cropId } })
  if (!crop) throw new AppError(404, 'Crop not found')

  const { media, imageUrl } = normalizeMediaInput(input.media as ListingMediaInput[] | undefined, input.imageUrl)

  const listing = await prisma.listing.create({
    data: {
      farmerId: farmer.id,
      cropId: input.cropId,
      variety: input.variety,
      quantity: input.quantity,
      unit: input.unit ?? crop.unit,
      expectedPrice: input.expectedPrice,
      district: input.district ?? farmer.district,
      state: input.state ?? farmer.state,
      harvestDate: parseOptionalDate(input.harvestDate),
      availableFrom: parseOptionalDate(input.availableFrom) ?? new Date(),
      availableUntil: parseOptionalDate(input.availableUntil),
      description: input.description,
      imageUrl,
      media: media.length > 0 ? media : undefined,
      status: ListingStatus.ACTIVE,
    },
    include: {
      crop: { select: { id: true, name: true, nameTamil: true, category: true, unit: true } },
      farmer: { select: { id: true, name: true, isVerified: true, district: true } },
    },
  })

  return formatListing(listing)
}

export async function updateListing(userId: string, listingId: string, input: UpdateListingInput) {
  const farmer = await getFarmerByUserId(userId)
  const existing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!existing) throw new AppError(404, 'Listing not found')
  if (existing.farmerId !== farmer.id) {
    throw new AppError(403, 'You can only modify your own listings')
  }

  const mediaPayload =
    input.media !== undefined
      ? normalizeMediaInput(input.media as ListingMediaInput[] | undefined, input.imageUrl)
      : null

  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...(input.cropId && { cropId: input.cropId }),
      variety: input.variety !== undefined ? input.variety : undefined,
      quantity: input.quantity,
      unit: input.unit,
      expectedPrice: input.expectedPrice,
      district: input.district,
      state: input.state,
      harvestDate: input.harvestDate !== undefined ? parseOptionalDate(input.harvestDate) : undefined,
      availableFrom: input.availableFrom !== undefined ? parseOptionalDate(input.availableFrom) : undefined,
      availableUntil: input.availableUntil !== undefined ? parseOptionalDate(input.availableUntil) : undefined,
      description: input.description !== undefined ? input.description : undefined,
      ...(mediaPayload
        ? {
            media: mediaPayload.media.length > 0 ? mediaPayload.media : [],
            imageUrl: mediaPayload.imageUrl,
          }
        : input.imageUrl !== undefined
          ? { imageUrl: input.imageUrl || null }
          : {}),
      status: input.status,
    },
    include: {
      crop: { select: { id: true, name: true, nameTamil: true, category: true, unit: true } },
      farmer: { select: { id: true, name: true, isVerified: true, district: true } },
    },
  })

  return formatListing(listing)
}

export async function deleteListing(userId: string, listingId: string) {
  const farmer = await getFarmerByUserId(userId)
  const existing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!existing) throw new AppError(404, 'Listing not found')
  if (existing.farmerId !== farmer.id) {
    throw new AppError(403, 'You can only delete your own listings')
  }

  await prisma.listing.delete({ where: { id: listingId } })
  return { deleted: true }
}
