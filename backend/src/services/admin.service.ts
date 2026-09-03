import { ListingStatus, OrderStatus } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'

export async function getAdminDashboard() {
  const [
    farmersCount,
    buyersCount,
    verifiedFarmers,
    verifiedBuyers,
    activeListings,
    totalOrders,
    completedOrders,
    salesAggregate,
    recentOrders,
    unverifiedFarmers,
    unverifiedBuyers,
  ] = await Promise.all([
    prisma.farmer.count(),
    prisma.buyer.count(),
    prisma.farmer.count({ where: { isVerified: true } }),
    prisma.buyer.count({ where: { isVerified: true } }),
    prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
    prisma.salesRecord.aggregate({ _sum: { totalAmount: true }, _count: true }),
    prisma.order.findMany({
      take: 8,
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: { include: { crop: { select: { name: true, nameTamil: true } } } },
        farmer: { select: { name: true } },
        buyer: { select: { name: true, organization: true } },
      },
    }),
    prisma.farmer.count({ where: { isVerified: false } }),
    prisma.buyer.count({ where: { isVerified: false } }),
  ])

  return {
    kpis: {
      totalUsers: farmersCount + buyersCount + 1,
      farmers: farmersCount,
      buyers: buyersCount,
      verifiedFarmers,
      verifiedBuyers,
      activeListings,
      totalOrders,
      completedOrders,
      totalSalesVolume: Math.round(salesAggregate._sum.totalAmount ?? 0),
      salesCount: salesAggregate._count,
      pendingVerifications: unverifiedFarmers + unverifiedBuyers,
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      updatedAt: order.updatedAt,
      crop: order.listing.crop,
      farmerName: order.farmer.name,
      buyerName: order.buyer.organization ?? order.buyer.name,
    })),
  }
}

export async function listFarmers() {
  const farmers = await prisma.farmer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, createdAt: true } },
      _count: { select: { listings: true, orders: true } },
    },
  })

  return farmers.map((f) => ({
    id: f.id,
    userId: f.userId,
    name: f.name,
    email: f.email,
    phone: f.phone,
    district: f.district,
    isVerified: f.isVerified,
    listingsCount: f._count.listings,
    ordersCount: f._count.orders,
    createdAt: f.createdAt,
  }))
}

export async function listBuyers() {
  const buyers = await prisma.buyer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, createdAt: true } },
      _count: { select: { orders: true, purchaseRequests: true } },
    },
  })

  return buyers.map((b) => ({
    id: b.id,
    userId: b.userId,
    name: b.name,
    email: b.email,
    phone: b.phone,
    organization: b.organization,
    district: b.district,
    buyerType: b.buyerType,
    isVerified: b.isVerified,
    ordersCount: b._count.orders,
    requestsCount: b._count.purchaseRequests,
    createdAt: b.createdAt,
  }))
}

export async function setFarmerVerified(farmerId: string, isVerified: boolean) {
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: { user: true },
  })
  if (!farmer) throw new AppError(404, 'Farmer not found')

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.farmer.update({
      where: { id: farmerId },
      data: { isVerified },
    })

    await tx.notification.create({
      data: {
        userId: farmer.userId,
        title: isVerified ? 'Account verified' : 'Verification removed',
        message: isVerified
          ? 'Your farmer account has been verified by Namma Sandhai admin'
          : 'Your verification badge has been removed. Contact support if this is unexpected.',
        type: 'VERIFICATION',
      },
    })

    return result
  })

  return {
    id: updated.id,
    isVerified: updated.isVerified,
  }
}

export async function setBuyerVerified(buyerId: string, isVerified: boolean) {
  const buyer = await prisma.buyer.findUnique({
    where: { id: buyerId },
    include: { user: true },
  })
  if (!buyer) throw new AppError(404, 'Buyer not found')

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.buyer.update({
      where: { id: buyerId },
      data: { isVerified },
    })

    await tx.notification.create({
      data: {
        userId: buyer.userId,
        title: isVerified ? 'Account verified' : 'Verification removed',
        message: isVerified
          ? 'Your buyer account has been verified by Namma Sandhai admin'
          : 'Your verification badge has been removed. Contact support if this is unexpected.',
        type: 'VERIFICATION',
      },
    })

    return result
  })

  return {
    id: updated.id,
    isVerified: updated.isVerified,
  }
}
