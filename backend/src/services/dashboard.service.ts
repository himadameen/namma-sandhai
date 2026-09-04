import { ListingStatus, OrderStatus, PurchaseRequestStatus } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'

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

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, month] = key.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export async function getFarmerDashboard(userId: string) {
  const farmer = await getFarmerByUserId(userId)

  const [
    activeListings,
    pendingRequests,
    activeOrders,
    salesRecords,
    recentSales,
    orders,
  ] = await Promise.all([
    prisma.listing.count({
      where: { farmerId: farmer.id, status: ListingStatus.ACTIVE },
    }),
    prisma.purchaseRequest.count({
      where: {
        status: { in: [PurchaseRequestStatus.PENDING, PurchaseRequestStatus.COUNTERED] },
        listing: { farmerId: farmer.id },
      },
    }),
    prisma.order.count({
      where: {
        farmerId: farmer.id,
        status: {
          in: [
            OrderStatus.PENDING_CONFIRMATION,
            OrderStatus.CONFIRMED,
            OrderStatus.IN_TRANSIT,
          ],
        },
      },
    }),
    prisma.salesRecord.findMany({
      where: { farmerId: farmer.id },
      include: {
        crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
      },
      orderBy: { soldAt: 'desc' },
    }),
    prisma.salesRecord.findMany({
      where: { farmerId: farmer.id },
      include: {
        crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
      },
      orderBy: { soldAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { farmerId: farmer.id },
      select: { status: true },
    }),
  ])

  const totalRevenue = salesRecords.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalQuantitySold = salesRecords.reduce((sum, r) => sum + r.quantity, 0)

  const monthlyMap = new Map<string, { revenue: number; quantity: number }>()
  for (const record of salesRecords) {
    const key = monthKey(record.soldAt)
    const entry = monthlyMap.get(key) ?? { revenue: 0, quantity: 0 }
    entry.revenue += record.totalAmount
    entry.quantity += record.quantity
    monthlyMap.set(key, entry)
  }

  const monthlySales = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, value]) => ({
      month: monthLabel(key),
      monthKey: key,
      revenue: Math.round(value.revenue),
      quantity: Math.round(value.quantity * 100) / 100,
    }))

  const cropMap = new Map<
    string,
    { cropId: string; cropName: string; cropNameTamil: string; revenue: number; quantity: number; count: number }
  >()

  for (const record of salesRecords) {
    const existing = cropMap.get(record.cropId) ?? {
      cropId: record.crop.id,
      cropName: record.crop.name,
      cropNameTamil: record.crop.nameTamil,
      revenue: 0,
      quantity: 0,
      count: 0,
    }
    existing.revenue += record.totalAmount
    existing.quantity += record.quantity
    existing.count += 1
    cropMap.set(record.cropId, existing)
  }

  const salesByCrop = Array.from(cropMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .map((item) => ({
      ...item,
      revenue: Math.round(item.revenue),
      quantity: Math.round(item.quantity * 100) / 100,
      sharePercent:
        totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 1000) / 10 : 0,
    }))

  const ordersByStatus = {
    pending: orders.filter((o) => o.status === OrderStatus.PENDING_CONFIRMATION).length,
    confirmed: orders.filter((o) => o.status === OrderStatus.CONFIRMED).length,
    inTransit: orders.filter((o) => o.status === OrderStatus.IN_TRANSIT).length,
    completed: orders.filter((o) => o.status === OrderStatus.COMPLETED).length,
    cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
  }

  const weeklyMap = new Map<string, number>()
  for (const record of salesRecords) {
    const d = new Date(record.soldAt)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay())
    const key = d.toISOString().slice(0, 10)
    weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + record.totalAmount)
  }

  const weeklySales = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([key, revenue]) => ({
      week: new Date(key).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      weekKey: key,
      revenue: Math.round(revenue),
    }))

  return {
    kpis: {
      activeListings,
      pendingRequests,
      activeOrders,
      totalRevenue: Math.round(totalRevenue),
      totalSalesCount: salesRecords.length,
      totalQuantitySold: Math.round(totalQuantitySold * 100) / 100,
    },
    monthlySales,
    weeklySales,
    salesByCrop,
    ordersByStatus,
    recentSales: recentSales.map(formatSalesRecord),
  }
}

export async function getBuyerDashboard(userId: string) {
  const buyer = await getBuyerByUserId(userId)

  const [pendingRequests, activeOrders, completedOrders, orders] = await Promise.all([
    prisma.purchaseRequest.count({
      where: {
        buyerId: buyer.id,
        status: { in: [PurchaseRequestStatus.PENDING, PurchaseRequestStatus.COUNTERED] },
      },
    }),
    prisma.order.count({
      where: {
        buyerId: buyer.id,
        status: {
          in: [
            OrderStatus.PENDING_CONFIRMATION,
            OrderStatus.CONFIRMED,
            OrderStatus.IN_TRANSIT,
          ],
        },
      },
    }),
    prisma.order.count({
      where: { buyerId: buyer.id, status: OrderStatus.COMPLETED },
    }),
    prisma.order.findMany({
      where: { buyerId: buyer.id },
      include: {
        listing: {
          include: {
            crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
          },
        },
        farmer: { select: { id: true, name: true, district: true, isVerified: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ])

  const completedOrderTotals = await prisma.order.aggregate({
    where: { buyerId: buyer.id, status: OrderStatus.COMPLETED },
    _sum: { totalAmount: true },
  })

  return {
    kpis: {
      pendingRequests,
      activeOrders,
      completedOrders,
      totalSpent: Math.round(completedOrderTotals._sum.totalAmount ?? 0),
    },
    recentOrders: orders.map((order) => ({
      id: order.id,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      status: order.status,
      updatedAt: order.updatedAt,
      crop: order.listing.crop,
      farmer: order.farmer,
    })),
  }
}

function formatSalesRecord(record: {
  id: string
  buyerName: string
  quantity: number
  unit: string
  price: number
  totalAmount: number
  soldAt: Date
  crop: { id: string; name: string; nameTamil: string; unit: string }
}) {
  return {
    id: record.id,
    buyerName: record.buyerName,
    quantity: record.quantity,
    unit: record.unit,
    price: record.price,
    totalAmount: record.totalAmount,
    soldAt: record.soldAt,
    crop: record.crop,
  }
}

export { formatSalesRecord }
