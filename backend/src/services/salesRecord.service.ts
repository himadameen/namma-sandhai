import { Prisma } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type { FarmerSalesQuery } from '../validators/salesRecord.validator'
import { formatSalesRecord } from './dashboard.service'

async function getFarmerByUserId(userId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) throw new AppError(404, 'Farmer profile not found')
  return farmer
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function yearKey(date: Date) {
  return date.getFullYear()
}

function buildLastMonthKeys(count: number) {
  const now = new Date()
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  return keys
}

type CropAggregate = {
  cropId: string
  cropName: string
  cropNameTamil: string
  revenue: number
  quantity: number
  count: number
}

function aggregateCrops(
  records: Array<{
    cropId: string
    totalAmount: number
    quantity: number
    crop: { id: string; name: string; nameTamil: string }
  }>
): CropAggregate[] {
  const map = new Map<string, CropAggregate>()
  for (const record of records) {
    const existing = map.get(record.cropId) ?? {
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
    map.set(record.cropId, existing)
  }
  return Array.from(map.values())
    .map((item) => ({
      ...item,
      revenue: Math.round(item.revenue),
      quantity: Math.round(item.quantity * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export async function getFarmerSalesRecords(userId: string, query: FarmerSalesQuery) {
  const farmer = await getFarmerByUserId(userId)

  const allRecords = await prisma.salesRecord.findMany({
    where: { farmerId: farmer.id },
    include: {
      crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
    },
    orderBy: { soldAt: 'desc' },
  })

  const totalRevenue = allRecords.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalQuantity = allRecords.reduce((sum, r) => sum + r.quantity, 0)

  const monthKeys12 = buildLastMonthKeys(12)
  const currentMonthKey = monthKeys12[monthKeys12.length - 1]
  const previousMonthKey = monthKeys12[monthKeys12.length - 2]

  const monthlyMap = new Map<string, { revenue: number; quantity: number; count: number }>()
  const yearlyMap = new Map<number, { revenue: number; quantity: number; count: number }>()

  for (const record of allRecords) {
    const mKey = monthKey(record.soldAt)
    const monthEntry = monthlyMap.get(mKey) ?? { revenue: 0, quantity: 0, count: 0 }
    monthEntry.revenue += record.totalAmount
    monthEntry.quantity += record.quantity
    monthEntry.count += 1
    monthlyMap.set(mKey, monthEntry)

    const yKey = yearKey(record.soldAt)
    const yearEntry = yearlyMap.get(yKey) ?? { revenue: 0, quantity: 0, count: 0 }
    yearEntry.revenue += record.totalAmount
    yearEntry.quantity += record.quantity
    yearEntry.count += 1
    yearlyMap.set(yKey, yearEntry)
  }

  const monthlyRevenue = monthKeys12.map((key) => {
    const value = monthlyMap.get(key) ?? { revenue: 0, quantity: 0, count: 0 }
    return {
      monthKey: key,
      revenue: Math.round(value.revenue),
      quantity: Math.round(value.quantity * 100) / 100,
      count: value.count,
    }
  })

  const yearlyRevenue = Array.from(yearlyMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => ({
      year,
      revenue: Math.round(value.revenue),
      quantity: Math.round(value.quantity * 100) / 100,
      count: value.count,
    }))

  const currentMonthRecords = allRecords.filter((r) => monthKey(r.soldAt) === currentMonthKey)
  const previousMonthRecords = allRecords.filter((r) => monthKey(r.soldAt) === previousMonthKey)

  const currentMonthRevenue = monthlyMap.get(currentMonthKey)?.revenue ?? 0
  const previousMonthRevenue = monthlyMap.get(previousMonthKey)?.revenue ?? 0

  let monthOverMonthPercent: number | null = null
  let monthOverMonthDirection: 'up' | 'down' | 'stable' = 'stable'
  if (previousMonthRevenue > 0) {
    monthOverMonthPercent = Math.round(
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 1000
    ) / 10
    monthOverMonthDirection =
      monthOverMonthPercent > 0 ? 'up' : monthOverMonthPercent < 0 ? 'down' : 'stable'
  } else if (currentMonthRevenue > 0) {
    monthOverMonthPercent = 100
    monthOverMonthDirection = 'up'
  }

  const bestMonthEntry = Array.from(monthlyMap.entries()).sort(
    ([, a], [, b]) => b.revenue - a.revenue
  )[0]
  const bestYearEntry = Array.from(yearlyMap.entries()).sort(
    ([, a], [, b]) => b.revenue - a.revenue
  )[0]

  const currentYear = new Date().getFullYear()
  const currentYearRevenue =
    yearlyMap.get(currentYear)?.revenue ?? allRecords
      .filter((r) => yearKey(r.soldAt) === currentYear)
      .reduce((sum, r) => sum + r.totalAmount, 0)

  const listWhere: Prisma.SalesRecordWhereInput = { farmerId: farmer.id }
  if (query.cropId) listWhere.cropId = query.cropId
  if (query.year) {
    listWhere.soldAt = {
      gte: new Date(query.year, 0, 1),
      lt: new Date(query.year + 1, 0, 1),
    }
  }
  if (query.search) {
    listWhere.OR = [
      { buyerName: { contains: query.search, mode: 'insensitive' } },
      { crop: { name: { contains: query.search, mode: 'insensitive' } } },
      { crop: { nameTamil: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const skip = (query.page - 1) * query.limit
  const [pageRecords, filteredTotal] = await Promise.all([
    prisma.salesRecord.findMany({
      where: listWhere,
      include: {
        crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
      },
      orderBy: { soldAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.salesRecord.count({ where: listWhere }),
  ])

  return {
    records: pageRecords.map(formatSalesRecord),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: filteredTotal,
      totalPages: Math.max(1, Math.ceil(filteredTotal / query.limit)),
    },
    summary: {
      totalRecords: allRecords.length,
      totalRevenue: Math.round(totalRevenue),
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      avgOrderValue:
        allRecords.length > 0 ? Math.round(totalRevenue / allRecords.length) : 0,
      currentMonthRevenue: Math.round(currentMonthRevenue),
      previousMonthRevenue: Math.round(previousMonthRevenue),
      currentYearRevenue: Math.round(currentYearRevenue),
    },
    insights: {
      monthOverMonthPercent,
      monthOverMonthDirection,
      currentMonthKey,
      previousMonthKey,
      bestMonthKey: bestMonthEntry?.[0] ?? null,
      bestMonthRevenue: bestMonthEntry ? Math.round(bestMonthEntry[1].revenue) : 0,
      bestYear: bestYearEntry?.[0] ?? null,
      bestYearRevenue: bestYearEntry ? Math.round(bestYearEntry[1].revenue) : 0,
    },
    yearlyRevenue,
    monthlyRevenue,
    topCropsOverall: aggregateCrops(allRecords).slice(0, 5),
    topCropsThisMonth: aggregateCrops(currentMonthRecords).slice(0, 5),
    topCropsLastMonth: aggregateCrops(previousMonthRecords).slice(0, 5),
  }
}

function escapeCsv(value: string | number) {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function exportFarmerSalesCsv(userId: string) {
  const farmer = await getFarmerByUserId(userId)

  const records = await prisma.salesRecord.findMany({
    where: { farmerId: farmer.id },
    include: { crop: true },
    orderBy: { soldAt: 'desc' },
  })

  const headers = [
    'Date',
    'Crop',
    'Crop (Tamil)',
    'Buyer',
    'Quantity',
    'Unit',
    'Price (INR)',
    'Total (INR)',
  ]

  const rows = records.map((record) => [
    record.soldAt.toISOString().slice(0, 10),
    record.crop.name,
    record.crop.nameTamil,
    record.buyerName,
    record.quantity,
    record.unit,
    record.price,
    record.totalAmount,
  ])

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')

  return {
    filename: `namma-sandhai-sales-${farmer.name.replace(/\s+/g, '-').toLowerCase()}.csv`,
    content: csv,
  }
}
