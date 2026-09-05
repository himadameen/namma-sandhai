import {
  ListingStatus,
  NotificationType,
  OrderStatus,
  Prisma,
} from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type { FarmerOrdersQuery, UpdateOrderStatusInput, BuyerOrdersQuery } from '../validators/order.validator'

const ORDER_STEPS: OrderStatus[] = [
  OrderStatus.PENDING_CONFIRMATION,
  OrderStatus.CONFIRMED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.COMPLETED,
]

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_CONFIRMATION]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
}

const FARMER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PENDING_CONFIRMATION]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.COMPLETED],
}

const BUYER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PENDING_CONFIRMATION]: [OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.COMPLETED],
}

function buildTimeline(status: OrderStatus) {
  const currentIndex = ORDER_STEPS.indexOf(status)
  const isCancelled = status === OrderStatus.CANCELLED

  return ORDER_STEPS.map((step, index) => ({
    status: step,
    label: step,
    completed: !isCancelled && currentIndex >= index,
    current: !isCancelled && currentIndex === index,
  }))
}

function formatOrder(order: NonNullable<Awaited<ReturnType<typeof fetchOrderById>>>) {
  return {
    id: order.id,
    quantity: order.quantity,
    agreedPrice: order.agreedPrice,
    totalAmount: order.totalAmount,
    deliveryType: order.deliveryType,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    timeline: buildTimeline(order.status),
    buyer: order.buyer,
    farmer: order.farmer,
    listing: {
      id: order.listing.id,
      variety: order.listing.variety,
      district: order.listing.district,
      unit: order.listing.unit,
      imageUrl: order.listing.imageUrl,
      crop: order.listing.crop,
    },
    salesRecord: order.salesRecord
      ? { id: order.salesRecord.id, soldAt: order.salesRecord.soldAt }
      : null,
  }
}

async function fetchOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          organization: true,
          district: true,
          userId: true,
        },
      },
      farmer: {
        select: {
          id: true,
          name: true,
          district: true,
          isVerified: true,
          userId: true,
        },
      },
      listing: {
        include: {
          crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
        },
      },
      salesRecord: { select: { id: true, soldAt: true } },
    },
  })
}

async function getFarmerByUserId(userId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) throw new AppError(404, 'Farmer profile not found')
  return farmer
}

async function getBuyerByUserId(userId: string) {
  const buyer = await prisma.buyer.findUnique({ where: { userId } })
  if (!buyer) throw new AppError(404, 'Buyer profile not found')
  return buyer
}

function assertTransition(
  current: OrderStatus,
  next: OrderStatus,
  role: 'FARMER' | 'BUYER'
) {
  const allowed = ALLOWED_TRANSITIONS[current]
  if (!allowed.includes(next)) {
    throw new AppError(400, `Cannot transition from ${current} to ${next}`)
  }

  const roleAllowed =
    role === 'FARMER' ? FARMER_TRANSITIONS[current] : BUYER_TRANSITIONS[current]

  if (!roleAllowed?.includes(next)) {
    throw new AppError(403, 'You are not allowed to perform this status update')
  }
}

async function notifyOrderUpdate(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  title: string,
  message: string
) {
  await tx.notification.create({
    data: {
      userId,
      title,
      message,
      type: NotificationType.ORDER_UPDATE,
    },
  })
}

export async function getFarmerOrders(userId: string, query: FarmerOrdersQuery) {
  const farmer = await getFarmerByUserId(userId)

  const listingFilter: Prisma.ListingWhereInput = {}
  if (query.cropId) listingFilter.cropId = query.cropId

  const where: Prisma.OrderWhereInput = {
    farmerId: farmer.id,
    ...(query.cropId ? { listing: listingFilter } : {}),
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
  const farmerWhere = { farmerId: farmer.id }

  const [
    orders,
    total,
    pendingCount,
    confirmedCount,
    inTransitCount,
    completedCount,
    cancelledCount,
  ] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: { id: true, name: true, organization: true, district: true, userId: true },
        },
        farmer: {
          select: { id: true, name: true, district: true, isVerified: true, userId: true },
        },
        listing: {
          include: {
            crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
          },
        },
        salesRecord: { select: { id: true, soldAt: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.order.count({ where }),
    prisma.order.count({
      where: { ...farmerWhere, status: OrderStatus.PENDING_CONFIRMATION },
    }),
    prisma.order.count({ where: { ...farmerWhere, status: OrderStatus.CONFIRMED } }),
    prisma.order.count({ where: { ...farmerWhere, status: OrderStatus.IN_TRANSIT } }),
    prisma.order.count({ where: { ...farmerWhere, status: OrderStatus.COMPLETED } }),
    prisma.order.count({ where: { ...farmerWhere, status: OrderStatus.CANCELLED } }),
  ])

  const activeCount = pendingCount + confirmedCount + inTransitCount

  return {
    orders: orders.map(formatOrder),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
    summary: {
      total: pendingCount + confirmedCount + inTransitCount + completedCount + cancelledCount,
      active: activeCount,
      pendingConfirmation: pendingCount,
      confirmed: confirmedCount,
      inTransit: inTransitCount,
      completed: completedCount,
      cancelled: cancelledCount,
    },
  }
}

export async function getBuyerOrders(userId: string, query: BuyerOrdersQuery) {
  const buyer = await getBuyerByUserId(userId)

  const listingFilter: Prisma.ListingWhereInput = {}
  if (query.cropId) listingFilter.cropId = query.cropId

  const where: Prisma.OrderWhereInput = {
    buyerId: buyer.id,
    ...(query.cropId ? { listing: listingFilter } : {}),
  }

  if (query.status) where.status = query.status
  if (query.deliveryType) where.deliveryType = query.deliveryType

  if (query.search) {
    where.AND = [
      {
        OR: [
          { farmer: { name: { contains: query.search, mode: 'insensitive' } } },
          { farmer: { district: { contains: query.search, mode: 'insensitive' } } },
          { listing: { district: { contains: query.search, mode: 'insensitive' } } },
          { listing: { crop: { name: { contains: query.search, mode: 'insensitive' } } } },
          { listing: { crop: { nameTamil: { contains: query.search, mode: 'insensitive' } } } },
        ],
      },
    ]
  }

  const skip = (query.page - 1) * query.limit
  const buyerWhere = { buyerId: buyer.id }

  const [
    orders,
    total,
    pendingCount,
    confirmedCount,
    inTransitCount,
    completedCount,
    cancelledCount,
  ] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: { id: true, name: true, organization: true, district: true, userId: true },
        },
        farmer: {
          select: { id: true, name: true, district: true, isVerified: true, userId: true },
        },
        listing: {
          include: {
            crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
          },
        },
        salesRecord: { select: { id: true, soldAt: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.order.count({ where }),
    prisma.order.count({
      where: { ...buyerWhere, status: OrderStatus.PENDING_CONFIRMATION },
    }),
    prisma.order.count({ where: { ...buyerWhere, status: OrderStatus.CONFIRMED } }),
    prisma.order.count({ where: { ...buyerWhere, status: OrderStatus.IN_TRANSIT } }),
    prisma.order.count({ where: { ...buyerWhere, status: OrderStatus.COMPLETED } }),
    prisma.order.count({ where: { ...buyerWhere, status: OrderStatus.CANCELLED } }),
  ])

  const activeCount = pendingCount + confirmedCount + inTransitCount

  return {
    orders: orders.map(formatOrder),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
    summary: {
      total: pendingCount + confirmedCount + inTransitCount + completedCount + cancelledCount,
      active: activeCount,
      pendingConfirmation: pendingCount,
      confirmed: confirmedCount,
      inTransit: inTransitCount,
      completed: completedCount,
      cancelled: cancelledCount,
    },
  }
}

export async function getOrderForUser(userId: string, role: 'FARMER' | 'BUYER', orderId: string) {
  const order = await fetchOrderById(orderId)
  if (!order) throw new AppError(404, 'Order not found')

  if (role === 'FARMER') {
    const farmer = await getFarmerByUserId(userId)
    if (order.farmerId !== farmer.id) throw new AppError(403, 'Access denied')
  } else {
    const buyer = await getBuyerByUserId(userId)
    if (order.buyerId !== buyer.id) throw new AppError(403, 'Access denied')
  }

  return formatOrder(order)
}

export async function updateOrderStatus(
  userId: string,
  role: 'FARMER' | 'BUYER',
  orderId: string,
  input: UpdateOrderStatusInput
) {
  const order = await fetchOrderById(orderId)
  if (!order) throw new AppError(404, 'Order not found')

  if (role === 'FARMER') {
    const farmer = await getFarmerByUserId(userId)
    if (order.farmerId !== farmer.id) throw new AppError(403, 'Access denied')
  } else {
    const buyer = await getBuyerByUserId(userId)
    if (order.buyerId !== buyer.id) throw new AppError(403, 'Access denied')
  }

  const nextStatus = input.status as OrderStatus
  assertTransition(order.status, nextStatus, role)

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    })

    if (nextStatus === OrderStatus.COMPLETED) {
      const existingRecord = await tx.salesRecord.findUnique({ where: { orderId } })
      if (!existingRecord) {
        await tx.salesRecord.create({
          data: {
            orderId,
            farmerId: order.farmerId,
            cropId: order.listing.cropId,
            buyerName: order.buyer.organization ?? order.buyer.name,
            quantity: order.quantity,
            unit: order.listing.unit,
            price: order.agreedPrice,
            totalAmount: order.totalAmount,
            status: OrderStatus.COMPLETED,
            soldAt: new Date(),
          },
        })
      }

      const listing = await tx.listing.findUnique({ where: { id: order.listingId } })
      if (listing) {
        const remaining = listing.quantity - order.quantity
        await tx.listing.update({
          where: { id: order.listingId },
          data: {
            quantity: Math.max(0, remaining),
            status: remaining <= 0 ? ListingStatus.SOLD : listing.status,
          },
        })
      }
    }

    const statusLabel = nextStatus.replace(/_/g, ' ').toLowerCase()
    const cropName = order.listing.crop.name

    if (order.buyer.userId !== userId) {
      await notifyOrderUpdate(
        tx,
        order.buyer.userId,
        'Order updated',
        `Your ${cropName} order is now ${statusLabel}`
      )
    }
    if (order.farmer.userId !== userId) {
      await notifyOrderUpdate(
        tx,
        order.farmer.userId,
        'Order updated',
        `Order for ${cropName} is now ${statusLabel}`
      )
    }
  })

  const updated = await fetchOrderById(orderId)
  return formatOrder(updated!)
}
