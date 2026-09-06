import {
  DocumentStatus,
  EnquiryStatus,
  ListingStatus,
  OrderStatus,
  Prisma,
} from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import {
  computeGrowth,
  escapeCsv,
  paginationMeta,
  startOfDay,
  startOfMonth,
  startOfYear,
} from '../utils/adminHelpers'
import type {
  BuyersQuery,
  EnquiriesQuery,
  FarmersQuery,
  ListingsQuery,
  TransactionsQuery,
} from '../validators/admin.validator'

export async function getAdminDashboard() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const lastMonthEnd = monthStart

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
    inactiveUsers,
    openEnquiries,
    pendingKyc,
    monthlySales,
    lastMonthSales,
    monthlyOrders,
    userGrowth,
    salesByMonth,
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
        farmer: { select: { name: true, nameTamil: true } },
        buyer: { select: { name: true, organization: true } },
      },
    }),
    prisma.farmer.count({ where: { isVerified: false } }),
    prisma.buyer.count({ where: { isVerified: false } }),
    prisma.user.count({ where: { isActive: false, role: { not: 'ADMIN' } } }),
    prisma.supportEnquiry.count({ where: { status: { in: [EnquiryStatus.OPEN, EnquiryStatus.IN_PROGRESS] } } }),
    prisma.profileDocument.count({ where: { status: DocumentStatus.PENDING } }),
    prisma.salesRecord.aggregate({
      where: { soldAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.salesRecord.aggregate({
      where: { soldAt: { gte: lastMonthStart, lt: lastMonthEnd } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    getUserGrowthSeries(),
    getSalesByMonthSeries(6),
  ])

  const monthlyRevenue = Math.round(monthlySales._sum.totalAmount ?? 0)
  const lastMonthRevenue = Math.round(lastMonthSales._sum.totalAmount ?? 0)

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
      inactiveUsers,
      openEnquiries,
      pendingKyc,
      monthlyRevenue,
      monthlyOrders,
      revenueGrowth: computeGrowth(monthlyRevenue, lastMonthRevenue),
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      updatedAt: order.updatedAt,
      crop: order.listing.crop,
      farmerName: order.farmer.name,
      farmerNameTamil: order.farmer.nameTamil,
      buyerName: order.buyer.organization ?? order.buyer.name,
    })),
    charts: {
      userGrowth,
      salesByMonth,
    },
  }
}

async function getUserGrowthSeries() {
  const months: { label: string; farmers: number; buyers: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const [farmers, buyers] = await Promise.all([
      prisma.farmer.count({ where: { createdAt: { lt: end } } }),
      prisma.buyer.count({ where: { createdAt: { lt: end } } }),
    ])
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleString('en-IN', { month: 'short' }),
      farmers,
      buyers,
    })
  }
  return months
}

async function getSalesByMonthSeries(count: number) {
  const now = new Date()
  const series: { label: string; revenue: number; orders: number }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const [sales, orders] = await Promise.all([
      prisma.salesRecord.aggregate({
        where: { soldAt: { gte: start, lt: end } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: start, lt: end } } }),
    ])
    series.push({
      label: start.toLocaleString('en-IN', { month: 'short' }),
      revenue: Math.round(sales._sum.totalAmount ?? 0),
      orders,
    })
  }
  return series
}

export async function listFarmers(query: FarmersQuery) {
  const where: Prisma.FarmerWhereInput = {}
  if (query.district) where.district = query.district
  if (query.verified === 'true') where.isVerified = true
  if (query.verified === 'false') where.isVerified = false
  if (query.active === 'true') where.user = { isActive: true }
  if (query.active === 'false') where.user = { isActive: false }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { nameTamil: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const skip = (query.page - 1) * query.limit
  const [farmers, total] = await Promise.all([
    prisma.farmer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            createdAt: true,
            documents: { select: { status: true } },
          },
        },
        _count: { select: { listings: true, orders: true } },
      },
    }),
    prisma.farmer.count({ where }),
  ])

  return {
    items: farmers.map((f) => ({
      id: f.id,
      userId: f.userId,
      name: f.name,
      nameTamil: f.nameTamil,
      email: f.email,
      phone: f.phone,
      district: f.district,
      isVerified: f.isVerified,
      isActive: f.user.isActive,
      kycStatus: summarizeKyc(f.user.documents),
      listingsCount: f._count.listings,
      ordersCount: f._count.orders,
      createdAt: f.createdAt,
    })),
    pagination: paginationMeta(query.page, query.limit, total),
  }
}

export async function listBuyers(query: BuyersQuery) {
  const where: Prisma.BuyerWhereInput = {}
  if (query.district) where.district = query.district
  if (query.verified === 'true') where.isVerified = true
  if (query.verified === 'false') where.isVerified = false
  if (query.active === 'true') where.user = { isActive: true }
  if (query.active === 'false') where.user = { isActive: false }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { organization: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const skip = (query.page - 1) * query.limit
  const [buyers, total] = await Promise.all([
    prisma.buyer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            createdAt: true,
            documents: { select: { status: true } },
          },
        },
        _count: { select: { orders: true, purchaseRequests: true } },
      },
    }),
    prisma.buyer.count({ where }),
  ])

  return {
    items: buyers.map((b) => ({
      id: b.id,
      userId: b.userId,
      name: b.name,
      email: b.email,
      phone: b.phone,
      organization: b.organization,
      district: b.district,
      buyerType: b.buyerType,
      isVerified: b.isVerified,
      isActive: b.user.isActive,
      kycStatus: summarizeKyc(b.user.documents),
      ordersCount: b._count.orders,
      requestsCount: b._count.purchaseRequests,
      createdAt: b.createdAt,
    })),
    pagination: paginationMeta(query.page, query.limit, total),
  }
}

function summarizeKyc(docs: { status: DocumentStatus }[]) {
  if (!docs.length) return 'NOT_STARTED'
  if (docs.every((d) => d.status === DocumentStatus.APPROVED)) return 'VERIFIED'
  if (docs.some((d) => d.status === DocumentStatus.REJECTED)) return 'REJECTED'
  if (docs.some((d) => d.status === DocumentStatus.PENDING)) return 'PENDING'
  return 'INCOMPLETE'
}

export async function setUserActive(userId: string, isActive: boolean) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { farmer: true, buyer: true },
  })
  if (!user) throw new AppError(404, 'User not found')
  if (user.role === 'ADMIN') throw new AppError(400, 'Cannot deactivate admin accounts')

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({ where: { id: userId }, data: { isActive } })
    await tx.notification.create({
      data: {
        userId,
        title: isActive ? 'Account reactivated' : 'Account deactivated',
        message: isActive
          ? 'Your Namma Sandhai account has been reactivated by admin.'
          : 'Your account has been temporarily deactivated. Contact support for assistance.',
        type: 'GENERAL',
      },
    })
    return result
  })

  return { userId: updated.id, isActive: updated.isActive }
}

export async function setFarmerVerified(farmerId: string, isVerified: boolean) {
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: { user: true },
  })
  if (!farmer) throw new AppError(404, 'Farmer not found')

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.farmer.update({ where: { id: farmerId }, data: { isVerified } })
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

  return { id: updated.id, isVerified: updated.isVerified }
}

export async function setBuyerVerified(buyerId: string, isVerified: boolean) {
  const buyer = await prisma.buyer.findUnique({
    where: { id: buyerId },
    include: { user: true },
  })
  if (!buyer) throw new AppError(404, 'Buyer not found')

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.buyer.update({ where: { id: buyerId }, data: { isVerified } })
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

  return { id: updated.id, isVerified: updated.isVerified }
}

export async function listPendingKyc() {
  const docs = await prisma.profileDocument.findMany({
    where: { status: DocumentStatus.PENDING },
    orderBy: { submittedAt: 'asc' },
    include: {
      user: {
        include: {
          farmer: { select: { id: true, name: true, nameTamil: true, district: true } },
          buyer: { select: { id: true, name: true, district: true, organization: true } },
        },
      },
    },
  })

  return docs.map((doc) => ({
    id: doc.id,
    userId: doc.userId,
    type: doc.type,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    status: doc.status,
    submittedAt: doc.submittedAt,
    userRole: doc.user.role,
    userName: doc.user.farmer?.name ?? doc.user.buyer?.name ?? doc.user.email,
    userNameTamil: doc.user.farmer?.nameTamil ?? null,
    district: doc.user.farmer?.district ?? doc.user.buyer?.district ?? '',
    organization: doc.user.buyer?.organization ?? null,
  }))
}

export async function getUserKyc(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      documents: { orderBy: { type: 'asc' } },
      farmer: true,
      buyer: true,
    },
  })
  if (!user) throw new AppError(404, 'User not found')

  return {
    userId: user.id,
    role: user.role,
    name: user.farmer?.name ?? user.buyer?.name ?? user.email,
    isVerified: user.farmer?.isVerified ?? user.buyer?.isVerified ?? false,
    documents: user.documents,
  }
}

export async function reviewKycDocument(
  documentId: string,
  status: 'APPROVED' | 'REJECTED',
  reviewNote: string | undefined,
  adminUserId: string
) {
  const doc = await prisma.profileDocument.findUnique({
    where: { id: documentId },
    include: { user: { include: { farmer: true, buyer: true } } },
  })
  if (!doc) throw new AppError(404, 'Document not found')

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.profileDocument.update({
      where: { id: documentId },
      data: { status, reviewNote, reviewedBy: adminUserId, reviewedAt: new Date() },
    })

    const allDocs = await tx.profileDocument.findMany({ where: { userId: doc.userId } })
    const allApproved = allDocs.length > 0 && allDocs.every((d) => d.status === DocumentStatus.APPROVED)

    if (allApproved && doc.user.role === 'FARMER' && doc.user.farmer) {
      await tx.farmer.update({ where: { id: doc.user.farmer.id }, data: { isVerified: true } })
    }
    if (allApproved && doc.user.role === 'BUYER' && doc.user.buyer) {
      await tx.buyer.update({ where: { id: doc.user.buyer.id }, data: { isVerified: true } })
    }

    await tx.notification.create({
      data: {
        userId: doc.userId,
        title: status === DocumentStatus.APPROVED ? 'KYC document approved' : 'KYC document rejected',
        message:
          status === DocumentStatus.APPROVED
            ? `Your ${doc.type.replace(/_/g, ' ').toLowerCase()} document has been approved.`
            : `Your ${doc.type.replace(/_/g, ' ').toLowerCase()} document was rejected.${reviewNote ? ` Note: ${reviewNote}` : ''}`,
        type: 'VERIFICATION',
      },
    })

    return result
  })

  return updated
}

function buildListingsWhere(query: ListingsQuery): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {}
  if (query.district) where.district = query.district
  if (query.status) where.status = query.status
  if (query.farmerId) where.farmerId = query.farmerId

  const cropTerm = query.crop ?? query.search
  if (cropTerm) {
    where.crop = {
      OR: [
        { name: { contains: cropTerm, mode: 'insensitive' } },
        { nameTamil: { contains: cropTerm, mode: 'insensitive' } },
      ],
    }
  }
  if (query.search && !query.crop) {
    where.OR = [
      { farmer: { name: { contains: query.search, mode: 'insensitive' } } },
      { farmer: { nameTamil: { contains: query.search, mode: 'insensitive' } } },
      { district: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  return where
}

function mapListingStockSnapshot(
  quantity: number,
  snapshot: { quantity: number } | undefined
) {
  if (!snapshot) {
    return {
      yesterdayQuantity: null as number | null,
      change: null as number | null,
      changePercent: null as number | null,
      direction: null as 'up' | 'down' | 'stable' | null,
    }
  }
  const yesterdayQuantity = snapshot.quantity
  const change = quantity - yesterdayQuantity
  const changePercent =
    yesterdayQuantity > 0 ? Math.round((change / yesterdayQuantity) * 1000) / 10 : change > 0 ? 100 : 0
  return {
    yesterdayQuantity,
    change,
    changePercent,
    direction: (change > 0 ? 'up' : change < 0 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
  }
}

export async function listAdminListings(query: ListingsQuery) {
  const where = buildListingsWhere(query)

  const skip = (query.page - 1) * query.limit
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
      include: {
        crop: { select: { id: true, name: true, nameTamil: true, category: true, unit: true } },
        farmer: { select: { id: true, name: true, nameTamil: true, district: true, isVerified: true, email: true } },
      },
    }),
    prisma.listing.count({ where }),
  ])

  return {
    items: listings.map((l) => ({
      id: l.id,
      crop: l.crop,
      farmer: l.farmer,
      variety: l.variety,
      quantity: l.quantity,
      unit: l.unit,
      expectedPrice: l.expectedPrice,
      district: l.district,
      status: l.status,
      createdAt: l.createdAt,
    })),
    pagination: paginationMeta(query.page, query.limit, total),
  }
}

export async function listAdminListingsGrouped(query: ListingsQuery) {
  const where = buildListingsWhere(query)
  const yesterday = startOfDay(new Date(Date.now() - 86400000))

  const listings = await prisma.listing.findMany({
    where,
    orderBy: [{ farmer: { name: 'asc' } }, { createdAt: 'desc' }],
    include: {
      crop: { select: { id: true, name: true, nameTamil: true, category: true, unit: true } },
      farmer: {
        select: {
          id: true,
          name: true,
          nameTamil: true,
          district: true,
          isVerified: true,
          email: true,
          phone: true,
        },
      },
      quantitySnapshots: { where: { date: yesterday }, take: 1 },
    },
  })

  const groupMap = new Map<
    string,
    {
      farmer: (typeof listings)[0]['farmer']
      listings: Array<{
        id: string
        crop: (typeof listings)[0]['crop']
        variety: string | null
        quantity: number
        unit: string
        expectedPrice: number
        district: string
        status: string
        createdAt: Date
        stock: ReturnType<typeof mapListingStockSnapshot>
      }>
    }
  >()

  for (const listing of listings) {
    const stock = mapListingStockSnapshot(listing.quantity, listing.quantitySnapshots[0])
    const item = {
      id: listing.id,
      crop: listing.crop,
      variety: listing.variety,
      quantity: listing.quantity,
      unit: listing.unit,
      expectedPrice: listing.expectedPrice,
      district: listing.district,
      status: listing.status,
      createdAt: listing.createdAt,
      stock,
    }

    const existing = groupMap.get(listing.farmerId)
    if (existing) {
      existing.listings.push(item)
    } else {
      groupMap.set(listing.farmerId, { farmer: listing.farmer, listings: [item] })
    }
  }

  const allGroups = Array.from(groupMap.values()).map((group) => {
    const activeListings = group.listings.filter((l) => l.status === ListingStatus.ACTIVE)
    const totalStock = activeListings.reduce((sum, l) => sum + l.quantity, 0)
    const totalValue = group.listings.reduce((sum, l) => sum + l.quantity * l.expectedPrice, 0)
    return {
      farmer: group.farmer,
      stats: {
        productCount: group.listings.length,
        activeCount: activeListings.length,
        totalStock: Math.round(totalStock * 100) / 100,
        totalValue: Math.round(totalValue),
      },
      listings: group.listings,
    }
  })

  allGroups.sort((a, b) => b.stats.productCount - a.stats.productCount || a.farmer.name.localeCompare(b.farmer.name))

  const skip = (query.page - 1) * query.limit
  const pagedGroups = allGroups.slice(skip, skip + query.limit)

  return {
    summary: {
      farmerCount: allGroups.length,
      productCount: listings.length,
      totalStock: Math.round(
        listings.filter((l) => l.status === ListingStatus.ACTIVE).reduce((sum, l) => sum + l.quantity, 0) * 100
      ) / 100,
    },
    items: pagedGroups,
    pagination: paginationMeta(query.page, query.limit, allGroups.length),
  }
}

export async function listTransactions(query: TransactionsQuery) {
  const where: Prisma.OrderWhereInput = {}
  if (query.status) where.status = query.status
  if (query.district) where.listing = { district: query.district }
  if (query.from || query.to) {
    where.createdAt = {}
    if (query.from) where.createdAt.gte = new Date(query.from)
    if (query.to) where.createdAt.lte = new Date(query.to)
  }
  if (query.search) {
    where.OR = [
      { farmer: { name: { contains: query.search, mode: 'insensitive' } } },
      { buyer: { name: { contains: query.search, mode: 'insensitive' } } },
      { listing: { crop: { name: { contains: query.search, mode: 'insensitive' } } } },
    ]
  }

  const skip = (query.page - 1) * query.limit
  const [orders, total, completedCount, amountAgg, completedAgg] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: query.limit,
      include: {
        listing: {
          include: { crop: { select: { name: true, nameTamil: true, unit: true } } },
        },
        farmer: { select: { name: true, nameTamil: true, district: true } },
        buyer: { select: { name: true, organization: true, district: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.count({ where: { ...where, status: OrderStatus.COMPLETED } }),
    prisma.order.aggregate({ where, _sum: { totalAmount: true } }),
    prisma.order.aggregate({
      where: { ...where, status: OrderStatus.COMPLETED },
      _sum: { totalAmount: true },
    }),
  ])

  return {
    items: orders.map((o) => ({
      id: o.id,
      status: o.status,
      quantity: o.quantity,
      agreedPrice: o.agreedPrice,
      totalAmount: o.totalAmount,
      deliveryType: o.deliveryType,
      crop: o.listing.crop,
      district: o.listing.district,
      farmerName: o.farmer.name,
      farmerNameTamil: o.farmer.nameTamil,
      farmerDistrict: o.farmer.district,
      buyerName: o.buyer.organization ?? o.buyer.name,
      buyerDistrict: o.buyer.district,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
    summary: {
      totalCount: total,
      completedCount,
      totalAmount: Math.round(amountAgg._sum.totalAmount ?? 0),
      completedAmount: Math.round(completedAgg._sum.totalAmount ?? 0),
    },
    pagination: paginationMeta(query.page, query.limit, total),
  }
}

export async function listEnquiries(query: EnquiriesQuery) {
  const where: Prisma.SupportEnquiryWhereInput = {}
  if (query.status) where.status = query.status
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { subject: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const skip = (query.page - 1) * query.limit
  const [items, total, openCount, inProgressCount, resolvedCount, closedCount] = await Promise.all([
    prisma.supportEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.supportEnquiry.count({ where }),
    prisma.supportEnquiry.count({ where: { status: EnquiryStatus.OPEN } }),
    prisma.supportEnquiry.count({ where: { status: EnquiryStatus.IN_PROGRESS } }),
    prisma.supportEnquiry.count({ where: { status: EnquiryStatus.RESOLVED } }),
    prisma.supportEnquiry.count({ where: { status: EnquiryStatus.CLOSED } }),
  ])

  return {
    items,
    summary: {
      open: openCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      closed: closedCount,
      total: openCount + inProgressCount + resolvedCount + closedCount,
    },
    pagination: paginationMeta(query.page, query.limit, total),
  }
}

export async function createEnquiry(
  input: { name: string; email: string; phone?: string; subject: string; message: string },
  userId?: string
) {
  return prisma.supportEnquiry.create({
    data: { ...input, userId: userId ?? null },
  })
}

export async function updateEnquiry(
  id: string,
  input: { status?: EnquiryStatus; adminReply?: string; adminNotes?: string }
) {
  const enquiry = await prisma.supportEnquiry.findUnique({ where: { id } })
  if (!enquiry) throw new AppError(404, 'Enquiry not found')

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.supportEnquiry.update({
      where: { id },
      data: {
        ...input,
        resolvedAt:
          input.status === EnquiryStatus.RESOLVED || input.status === EnquiryStatus.CLOSED
            ? new Date()
            : enquiry.resolvedAt,
      },
    })

    if (enquiry.userId && input.adminReply) {
      await tx.notification.create({
        data: {
          userId: enquiry.userId,
          title: 'Support enquiry update',
          message: input.adminReply,
          type: 'GENERAL',
        },
      })
    }

    return result
  })

  return updated
}

export async function getAnalytics() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const lastMonthEnd = monthStart

  const [farmerRankings, buyerRankings, topSellingDay, topSellingMonth, topSellingYear, usageStats] =
    await Promise.all([
      getFarmerRankings(monthStart, lastMonthStart, lastMonthEnd),
      getBuyerRankings(monthStart, lastMonthStart, lastMonthEnd),
      getTopSellingItems(startOfDay(now), now),
      getTopSellingItems(monthStart, now),
      getTopSellingItems(startOfYear(now), now),
      getUsageStats(),
    ])

  return {
    farmerRankings,
    buyerRankings,
    topSelling: {
      day: topSellingDay,
      month: topSellingMonth,
      year: topSellingYear,
    },
    usageStats,
  }
}

async function getFarmerRankings(monthStart: Date, lastMonthStart: Date, lastMonthEnd: Date) {
  const [thisMonthRecords, lastMonthRecords] = await Promise.all([
    prisma.salesRecord.groupBy({
      by: ['farmerId'],
      where: { soldAt: { gte: monthStart } },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    }),
    prisma.salesRecord.groupBy({
      by: ['farmerId'],
      where: { soldAt: { gte: lastMonthStart, lt: lastMonthEnd } },
      _sum: { totalAmount: true },
    }),
  ])

  const farmerIds = thisMonthRecords.map((r) => r.farmerId)
  const farmers = await prisma.farmer.findMany({
    where: { id: { in: farmerIds } },
    select: { id: true, name: true, nameTamil: true, district: true, isVerified: true },
  })
  const farmerMap = new Map(farmers.map((f) => [f.id, f]))
  const lastMonthMap = new Map(
    lastMonthRecords.map((r) => [r.farmerId, Math.round(r._sum.totalAmount ?? 0)])
  )

  return thisMonthRecords.map((r, index) => {
    const thisMonth = Math.round(r._sum.totalAmount ?? 0)
    const lastMonth = lastMonthMap.get(r.farmerId) ?? 0
    const farmer = farmerMap.get(r.farmerId)
    return {
      rank: index + 1,
      medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null,
      farmerId: r.farmerId,
      name: farmer?.name ?? 'Unknown',
      nameTamil: farmer?.nameTamil ?? null,
      district: farmer?.district ?? '',
      isVerified: farmer?.isVerified ?? false,
      totalRevenue: thisMonth,
      previousPeriodRevenue: lastMonth,
      growth: computeGrowth(thisMonth, lastMonth),
    }
  })
}

async function getBuyerRankings(monthStart: Date, lastMonthStart: Date, lastMonthEnd: Date) {
  const [thisMonthOrders, lastMonthOrders] = await Promise.all([
    prisma.order.groupBy({
      by: ['buyerId'],
      where: { status: OrderStatus.COMPLETED, updatedAt: { gte: monthStart } },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['buyerId'],
      where: { status: OrderStatus.COMPLETED, updatedAt: { gte: lastMonthStart, lt: lastMonthEnd } },
      _sum: { totalAmount: true },
    }),
  ])

  const buyerIds = thisMonthOrders.map((o) => o.buyerId)
  const buyers = await prisma.buyer.findMany({
    where: { id: { in: buyerIds } },
    select: { id: true, name: true, organization: true, district: true, isVerified: true },
  })
  const buyerMap = new Map(buyers.map((b) => [b.id, b]))
  const lastMonthMap = new Map(
    lastMonthOrders.map((o) => [o.buyerId, Math.round(o._sum.totalAmount ?? 0)])
  )

  return thisMonthOrders.map((o, index) => {
    const thisMonth = Math.round(o._sum.totalAmount ?? 0)
    const lastMonth = lastMonthMap.get(o.buyerId) ?? 0
    const buyer = buyerMap.get(o.buyerId)
    return {
      rank: index + 1,
      medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null,
      buyerId: o.buyerId,
      name: buyer?.organization ?? buyer?.name ?? 'Unknown',
      district: buyer?.district ?? '',
      isVerified: buyer?.isVerified ?? false,
      totalSpend: thisMonth,
      previousPeriodSpend: lastMonth,
      growth: computeGrowth(thisMonth, lastMonth),
    }
  })
}

async function getTopSellingItems(from: Date, to: Date) {
  const records = await prisma.salesRecord.groupBy({
    by: ['cropId'],
    where: { soldAt: { gte: from, lte: to } },
    _sum: { totalAmount: true, quantity: true },
    _count: true,
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: 10,
  })

  const cropIds = records.map((r) => r.cropId)
  const crops = await prisma.crop.findMany({ where: { id: { in: cropIds } } })
  const cropMap = new Map(crops.map((c) => [c.id, c]))

  return records.map((r, index) => ({
    rank: index + 1,
    cropId: r.cropId,
    cropName: cropMap.get(r.cropId)?.name ?? 'Unknown',
    cropNameTamil: cropMap.get(r.cropId)?.nameTamil ?? '',
    unit: cropMap.get(r.cropId)?.unit ?? 'kg',
    revenue: Math.round(r._sum.totalAmount ?? 0),
    quantity: Math.round((r._sum.quantity ?? 0) * 100) / 100,
    orderCount: r._count,
  }))
}

async function getUsageStats() {
  const [listingsByStatus, ordersByStatus, requestsByStatus] = await Promise.all([
    prisma.listing.groupBy({ by: ['status'], _count: true }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.purchaseRequest.groupBy({ by: ['status'], _count: true }),
  ])

  return {
    listingsByStatus: listingsByStatus.map((x) => ({ status: x.status, count: x._count })),
    ordersByStatus: ordersByStatus.map((x) => ({ status: x.status, count: x._count })),
    requestsByStatus: requestsByStatus.map((x) => ({ status: x.status, count: x._count })),
  }
}

export async function getStockChanges(query: {
  page: number
  limit: number
  search?: string
  district?: string
  direction?: 'up' | 'down' | 'stable'
}) {
  await captureDailySnapshots()

  const yesterday = startOfDay(new Date(Date.now() - 86400000))
  const where: Prisma.ListingWhereInput = { status: ListingStatus.ACTIVE }
  if (query.district) where.district = query.district
  if (query.search) {
    where.OR = [
      { crop: { name: { contains: query.search, mode: 'insensitive' } } },
      { farmer: { name: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    include: {
      crop: { select: { name: true, nameTamil: true, unit: true } },
      farmer: { select: { name: true, nameTamil: true, district: true } },
      quantitySnapshots: { where: { date: yesterday }, take: 1 },
    },
  })

  const allItems = listings.map((l) => {
    const yesterdayQty = l.quantitySnapshots[0]?.quantity ?? l.quantity
    const change = l.quantity - yesterdayQty
    return {
      listingId: l.id,
      crop: l.crop,
      farmer: l.farmer,
      district: l.district,
      currentQuantity: l.quantity,
      yesterdayQuantity: yesterdayQty,
      change,
      changePercent: yesterdayQty > 0 ? Math.round((change / yesterdayQty) * 1000) / 10 : change > 0 ? 100 : 0,
      direction: (change > 0 ? 'up' : change < 0 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      unit: l.unit,
    }
  })

  const summary = {
    totalListings: allItems.length,
    increased: allItems.filter((i) => i.direction === 'up').length,
    decreased: allItems.filter((i) => i.direction === 'down').length,
    unchanged: allItems.filter((i) => i.direction === 'stable').length,
    netChange: Math.round(allItems.reduce((sum, i) => sum + i.change, 0) * 100) / 100,
  }

  const filtered = query.direction ? allItems.filter((i) => i.direction === query.direction) : allItems
  const skip = (query.page - 1) * query.limit
  const items = filtered.slice(skip, skip + query.limit)

  return {
    items,
    summary,
    pagination: paginationMeta(query.page, query.limit, filtered.length),
  }
}

async function captureDailySnapshots() {
  const today = startOfDay(new Date())
  const existing = await prisma.listingQuantitySnapshot.count({ where: { date: today } })
  if (existing > 0) return

  const listings = await prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE },
    select: { id: true, cropId: true, quantity: true },
  })

  if (!listings.length) return

  await prisma.listingQuantitySnapshot.createMany({
    data: listings.map((l) => ({
      listingId: l.id,
      cropId: l.cropId,
      quantity: l.quantity,
      date: today,
    })),
    skipDuplicates: true,
  })
}

export async function exportTransactionsCsv(query: TransactionsQuery) {
  const { items } = await listTransactions({ ...query, page: 1, limit: 10000 })
  const header = ['Order ID', 'Crop', 'Farmer', 'Buyer', 'District', 'Quantity', 'Amount (INR)', 'Status', 'Date']
  const rows = items.map((o) =>
    [
      o.id,
      o.crop.name,
      o.farmerName,
      o.buyerName,
      o.district,
      o.quantity,
      o.totalAmount,
      o.status,
      new Date(o.createdAt).toISOString().slice(0, 10),
    ]
      .map(escapeCsv)
      .join(',')
  )
  return [header.join(','), ...rows].join('\n')
}

export async function exportRevenueCsv() {
  const records = await prisma.salesRecord.findMany({
    orderBy: { soldAt: 'desc' },
    include: { crop: true, farmer: { select: { name: true, nameTamil: true, district: true } } },
  })
  const header = ['Date', 'Crop', 'Farmer', 'District', 'Buyer', 'Quantity', 'Unit', 'Price', 'Total (INR)']
  const rows = records.map((r) =>
    [r.soldAt.toISOString().slice(0, 10), r.crop.name, r.farmer.name, r.farmer.district, r.buyerName, r.quantity, r.unit, r.price, r.totalAmount]
      .map(escapeCsv)
      .join(',')
  )
  return [header.join(','), ...rows].join('\n')
}

export async function exportUsersCsv() {
  const [farmers, buyers] = await Promise.all([
    prisma.farmer.findMany({ include: { user: { select: { isActive: true } } } }),
    prisma.buyer.findMany({ include: { user: { select: { isActive: true } } } }),
  ])
  const header = ['Role', 'Name', 'Email', 'District', 'Verified', 'Active']
  const farmerRows = farmers.map((f) =>
    ['Farmer', f.name, f.email, f.district, String(f.isVerified), String(f.user.isActive)].map(escapeCsv).join(',')
  )
  const buyerRows = buyers.map((b) =>
    ['Buyer', b.organization ?? b.name, b.email, b.district, String(b.isVerified), String(b.user.isActive)].map(escapeCsv).join(',')
  )
  return [header.join(','), ...farmerRows, ...buyerRows].join('\n')
}

export async function exportListingsCsv(query: ListingsQuery) {
  const { items } = await listAdminListings({ ...query, page: 1, limit: 10000 })
  const header = ['Crop', 'Farmer', 'District', 'Quantity', 'Unit', 'Price', 'Status']
  const rows = items.map((l) =>
    [l.crop.name, l.farmer.name, l.district, l.quantity, l.unit, l.expectedPrice, l.status].map(escapeCsv).join(',')
  )
  return [header.join(','), ...rows].join('\n')
}
