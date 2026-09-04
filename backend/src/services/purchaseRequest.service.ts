import {
  DeliveryType,
  NotificationType,
  OrderStatus,
  Prisma,
  PurchaseRequestStatus,
} from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type {
  CounterOfferInput,
  CreatePurchaseRequestInput,
  FarmerPurchaseRequestsQuery,
} from '../validators/purchaseRequest.validator'

function formatRequest(req: Awaited<ReturnType<typeof fetchRequestById>>) {
  if (!req) return null
  return {
    id: req.id,
    listingId: req.listingId,
    quantity: req.quantity,
    offeredPrice: req.offeredPrice,
    deliveryType: req.deliveryType,
    message: req.message,
    status: req.status,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
    buyer: req.buyer,
    listing: {
      id: req.listing.id,
      quantity: req.listing.quantity,
      unit: req.listing.unit,
      expectedPrice: req.listing.expectedPrice,
      district: req.listing.district,
      crop: req.listing.crop,
      farmer: req.listing.farmer,
    },
    order: req.order ? { id: req.order.id, status: req.order.status } : null,
  }
}

async function fetchRequestById(id: string) {
  return prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, organization: true, district: true } },
      listing: {
        include: {
          crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
          farmer: { select: { id: true, name: true, userId: true } },
        },
      },
      order: { select: { id: true, status: true } },
    },
  })
}

async function getBuyerByUserId(userId: string) {
  const buyer = await prisma.buyer.findUnique({ where: { userId } })
  if (!buyer) throw new AppError(404, 'Buyer profile not found')
  return buyer
}

async function getFarmerByUserId(userId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) throw new AppError(404, 'Farmer profile not found')
  return farmer
}

export async function createPurchaseRequest(userId: string, input: CreatePurchaseRequestInput) {
  const buyer = await getBuyerByUserId(userId)

  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    include: {
      crop: true,
      farmer: { include: { user: true } },
    },
  })

  if (!listing) throw new AppError(404, 'Listing not found')
  if (listing.status !== 'ACTIVE') throw new AppError(400, 'This listing is no longer available')
  if (input.quantity > listing.quantity) {
    throw new AppError(400, `Quantity cannot exceed available ${listing.quantity} ${listing.unit}`)
  }

  const existingPending = await prisma.purchaseRequest.findFirst({
    where: {
      listingId: input.listingId,
      buyerId: buyer.id,
      status: PurchaseRequestStatus.PENDING,
    },
  })
  if (existingPending) {
    throw new AppError(409, 'You already have a pending request for this listing')
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.purchaseRequest.create({
      data: {
        listingId: input.listingId,
        buyerId: buyer.id,
        quantity: input.quantity,
        offeredPrice: input.offeredPrice,
        deliveryType: input.deliveryType as DeliveryType,
        message: input.message,
        status: PurchaseRequestStatus.PENDING,
      },
      include: {
        buyer: { select: { id: true, name: true, organization: true, district: true } },
        listing: {
          include: {
            crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
            farmer: { select: { id: true, name: true, userId: true } },
          },
        },
        order: { select: { id: true, status: true } },
      },
    })

    await tx.notification.create({
      data: {
        userId: listing.farmer.user.id,
        title: 'New purchase request',
        message: `New purchase request from ${buyer.organization ?? buyer.name} for ${listing.crop.name}`,
        type: NotificationType.PURCHASE_REQUEST,
      },
    })

    return created
  })

  return formatRequest(request)
}

export async function getBuyerPurchaseRequests(userId: string) {
  const buyer = await getBuyerByUserId(userId)
  const requests = await prisma.purchaseRequest.findMany({
    where: { buyerId: buyer.id },
    include: {
      buyer: { select: { id: true, name: true, organization: true, district: true } },
      listing: {
        include: {
          crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
          farmer: { select: { id: true, name: true, userId: true } },
        },
      },
      order: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return requests.map((r) => formatRequest(r)!)
}

export async function getFarmerPurchaseRequests(userId: string, query: FarmerPurchaseRequestsQuery) {
  const farmer = await getFarmerByUserId(userId)

  const listingFilter: Prisma.ListingWhereInput = { farmerId: farmer.id }
  if (query.cropId) listingFilter.cropId = query.cropId

  const where: Prisma.PurchaseRequestWhereInput = {
    listing: listingFilter,
  }

  if (query.status) where.status = query.status
  if (query.deliveryType) where.deliveryType = query.deliveryType

  if (query.search) {
    where.AND = [
      {
        OR: [
          { buyer: { name: { contains: query.search, mode: 'insensitive' } } },
          { buyer: { organization: { contains: query.search, mode: 'insensitive' } } },
          { buyer: { district: { contains: query.search, mode: 'insensitive' } } },
          { listing: { crop: { name: { contains: query.search, mode: 'insensitive' } } } },
          { listing: { crop: { nameTamil: { contains: query.search, mode: 'insensitive' } } } },
        ],
      },
    ]
  }

  const skip = (query.page - 1) * query.limit
  const farmerListingWhere = { listing: { farmerId: farmer.id } }

  const [requests, total, pendingCount, acceptedCount, rejectedCount, counteredCount] =
    await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, organization: true, district: true } },
          listing: {
            include: {
              crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
              farmer: { select: { id: true, name: true, userId: true } },
            },
          },
          order: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.purchaseRequest.count({ where }),
      prisma.purchaseRequest.count({
        where: { ...farmerListingWhere, status: PurchaseRequestStatus.PENDING },
      }),
      prisma.purchaseRequest.count({
        where: { ...farmerListingWhere, status: PurchaseRequestStatus.ACCEPTED },
      }),
      prisma.purchaseRequest.count({
        where: { ...farmerListingWhere, status: PurchaseRequestStatus.REJECTED },
      }),
      prisma.purchaseRequest.count({
        where: { ...farmerListingWhere, status: PurchaseRequestStatus.COUNTERED },
      }),
    ])

  return {
    requests: requests.map((r) => formatRequest(r)!),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
    summary: {
      total: pendingCount + acceptedCount + rejectedCount + counteredCount,
      pending: pendingCount,
      accepted: acceptedCount,
      rejected: rejectedCount,
      countered: counteredCount,
      actionRequired: pendingCount + counteredCount,
    },
  }
}

export async function acceptPurchaseRequest(userId: string, requestId: string) {
  const farmer = await getFarmerByUserId(userId)
  const request = await fetchRequestById(requestId)

  if (!request) throw new AppError(404, 'Purchase request not found')
  if (request.listing.farmer.id !== farmer.id) {
    throw new AppError(403, 'You can only respond to requests for your listings')
  }
  if (request.status !== PurchaseRequestStatus.PENDING && request.status !== PurchaseRequestStatus.COUNTERED) {
    throw new AppError(400, 'This request cannot be accepted')
  }
  if (request.order) throw new AppError(400, 'An order already exists for this request')

  const totalAmount = request.quantity * request.offeredPrice

  await prisma.$transaction(async (tx) => {
    const updated = await tx.purchaseRequest.update({
      where: { id: requestId },
      data: { status: PurchaseRequestStatus.ACCEPTED },
      include: {
        buyer: { select: { id: true, name: true, organization: true, district: true, userId: true } },
        listing: {
          include: {
            crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
            farmer: { select: { id: true, name: true, userId: true } },
          },
        },
        order: { select: { id: true, status: true } },
      },
    })

    const order = await tx.order.create({
      data: {
        purchaseRequestId: requestId,
        listingId: request.listingId,
        buyerId: request.buyerId,
        farmerId: farmer.id,
        quantity: request.quantity,
        agreedPrice: request.offeredPrice,
        totalAmount,
        deliveryType: request.deliveryType,
        status: OrderStatus.PENDING_CONFIRMATION,
      },
    })

    const buyerUser = await tx.user.findFirst({ where: { buyer: { id: request.buyerId } } })

    if (buyerUser) {
      await tx.notification.create({
        data: {
          userId: buyerUser.id,
          title: 'Request accepted',
          message: `Your request for ${request.listing.crop.name} has been accepted`,
          type: NotificationType.REQUEST_ACCEPTED,
        },
      })
    }

    return { ...updated, order }
  })

  const final = await fetchRequestById(requestId)
  return formatRequest(final)
}

export async function rejectPurchaseRequest(userId: string, requestId: string) {
  const farmer = await getFarmerByUserId(userId)
  const request = await fetchRequestById(requestId)

  if (!request) throw new AppError(404, 'Purchase request not found')
  if (request.listing.farmer.id !== farmer.id) {
    throw new AppError(403, 'You can only respond to requests for your listings')
  }
  if (request.status !== PurchaseRequestStatus.PENDING && request.status !== PurchaseRequestStatus.COUNTERED) {
    throw new AppError(400, 'This request cannot be rejected')
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.purchaseRequest.update({
      where: { id: requestId },
      data: { status: PurchaseRequestStatus.REJECTED },
      include: {
        buyer: { select: { id: true, name: true, organization: true, district: true, userId: true } },
        listing: {
          include: {
            crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
            farmer: { select: { id: true, name: true, userId: true } },
          },
        },
        order: { select: { id: true, status: true } },
      },
    })

    const buyerUser = await tx.user.findFirst({ where: { buyer: { id: request.buyerId } } })
    if (buyerUser) {
      await tx.notification.create({
        data: {
          userId: buyerUser.id,
          title: 'Request rejected',
          message: `Your request for ${request.listing.crop.name} was rejected`,
          type: NotificationType.REQUEST_REJECTED,
        },
      })
    }

    return result
  })

  return formatRequest(updated)
}

export async function counterPurchaseRequest(
  userId: string,
  requestId: string,
  input: CounterOfferInput
) {
  const farmer = await getFarmerByUserId(userId)
  const request = await fetchRequestById(requestId)

  if (!request) throw new AppError(404, 'Purchase request not found')
  if (request.listing.farmer.id !== farmer.id) {
    throw new AppError(403, 'You can only respond to requests for your listings')
  }
  if (request.status !== PurchaseRequestStatus.PENDING) {
    throw new AppError(400, 'Only pending requests can be countered')
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.purchaseRequest.update({
      where: { id: requestId },
      data: {
        status: PurchaseRequestStatus.COUNTERED,
        offeredPrice: input.offeredPrice,
        message: input.message ?? request.message,
      },
      include: {
        buyer: { select: { id: true, name: true, organization: true, district: true, userId: true } },
        listing: {
          include: {
            crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
            farmer: { select: { id: true, name: true, userId: true } },
          },
        },
        order: { select: { id: true, status: true } },
      },
    })

    const buyerUser = await tx.user.findFirst({ where: { buyer: { id: request.buyerId } } })
    if (buyerUser) {
      await tx.notification.create({
        data: {
          userId: buyerUser.id,
          title: 'Counter offer received',
          message: `Farmer countered your ${request.listing.crop.name} request at ₹${input.offeredPrice}/${request.listing.unit}`,
          type: NotificationType.REQUEST_COUNTERED,
        },
      })
    }

    return result
  })

  return formatRequest(updated)
}
