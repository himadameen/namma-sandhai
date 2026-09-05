import { Prisma } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import type { FarmerSalesExportQuery, FarmerSalesQuery } from '../validators/salesRecord.validator'
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

function soldAtRange(year: number, month?: number) {
  if (month) {
    return {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    }
  }
  return {
    gte: new Date(year, 0, 1),
    lt: new Date(year + 1, 0, 1),
  }
}

function computeChange(current: number, previous: number) {
  if (previous > 0) {
    const percent = Math.round(((current - previous) / previous) * 1000) / 10
    return {
      changePercent: percent,
      direction: (percent > 0 ? 'up' : percent < 0 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    }
  }
  if (current > 0) {
    return { changePercent: 100, direction: 'up' as const }
  }
  return { changePercent: null, direction: 'stable' as const }
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

function sumPeriod(records: { totalAmount: number; quantity: number }[]) {
  return records.reduce(
    (acc, record) => ({
      revenue: acc.revenue + record.totalAmount,
      quantity: acc.quantity + record.quantity,
      count: acc.count + 1,
    }),
    { revenue: 0, quantity: 0, count: 0 }
  )
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

  const availableYears = yearlyRevenue.map((y) => y.year).sort((a, b) => b - a)

  const currentMonthRecords = allRecords.filter((r) => monthKey(r.soldAt) === currentMonthKey)
  const previousMonthRecords = allRecords.filter((r) => monthKey(r.soldAt) === previousMonthKey)

  const currentMonthRevenue = monthlyMap.get(currentMonthKey)?.revenue ?? 0
  const previousMonthRevenue = monthlyMap.get(previousMonthKey)?.revenue ?? 0
  const currentMonthChange = computeChange(currentMonthRevenue, previousMonthRevenue)

  const bestMonthEntry = Array.from(monthlyMap.entries()).sort(
    ([, a], [, b]) => b.revenue - a.revenue
  )[0]
  const bestYearEntry = Array.from(yearlyMap.entries()).sort(
    ([, a], [, b]) => b.revenue - a.revenue
  )[0]

  const currentYear = new Date().getFullYear()
  const currentYearRevenue = yearlyMap.get(currentYear)?.revenue ?? 0

  let periodRecords = allRecords
  let previousPeriodRecords: typeof allRecords = []
  let comparisonType: 'previous_month' | 'previous_year' | 'all_time' = 'all_time'

  if (query.year && query.month) {
    periodRecords = allRecords.filter(
      (r) => yearKey(r.soldAt) === query.year && r.soldAt.getMonth() + 1 === query.month
    )
    const prevDate = new Date(query.year, query.month - 2, 1)
    previousPeriodRecords = allRecords.filter(
      (r) =>
        yearKey(r.soldAt) === prevDate.getFullYear() &&
        r.soldAt.getMonth() === prevDate.getMonth()
    )
    comparisonType = 'previous_month'
  } else if (query.year) {
    const selectedYear = query.year
    periodRecords = allRecords.filter((r) => yearKey(r.soldAt) === selectedYear)
    previousPeriodRecords = allRecords.filter((r) => yearKey(r.soldAt) === selectedYear - 1)
    comparisonType = 'previous_year'
  }

  const periodTotals = sumPeriod(periodRecords)
  const previousPeriodTotals = sumPeriod(previousPeriodRecords)
  const periodChange =
    query.year ? computeChange(periodTotals.revenue, previousPeriodTotals.revenue) : { changePercent: null, direction: 'stable' as const }

  const listWhere: Prisma.SalesRecordWhereInput = { farmerId: farmer.id }
  if (query.cropId) listWhere.cropId = query.cropId
  if (query.year) {
    listWhere.soldAt = soldAtRange(query.year, query.month)
  }
  if (query.search) {
    listWhere.AND = [
      {
        OR: [
          { buyerName: { contains: query.search, mode: 'insensitive' } },
          { crop: { name: { contains: query.search, mode: 'insensitive' } } },
          { crop: { nameTamil: { contains: query.search, mode: 'insensitive' } } },
        ],
      },
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

  const chartMonthlyRevenue = query.year
    ? Array.from({ length: 12 }, (_, index) => {
        const key = `${query.year}-${String(index + 1).padStart(2, '0')}`
        const value = monthlyMap.get(key) ?? { revenue: 0, quantity: 0, count: 0 }
        return {
          monthKey: key,
          revenue: Math.round(value.revenue),
          quantity: Math.round(value.quantity * 100) / 100,
          count: value.count,
        }
      })
    : monthlyRevenue

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
    periodReport: {
      year: query.year ?? null,
      month: query.month ?? null,
      revenue: Math.round(periodTotals.revenue),
      quantity: Math.round(periodTotals.quantity * 100) / 100,
      transactionCount: periodTotals.count,
      previousRevenue: Math.round(previousPeriodTotals.revenue),
      changePercent: periodChange.changePercent,
      direction: periodChange.direction,
      comparisonType,
    },
    insights: {
      monthOverMonthPercent: currentMonthChange.changePercent,
      monthOverMonthDirection: currentMonthChange.direction,
      currentMonthKey,
      previousMonthKey,
      bestMonthKey: bestMonthEntry?.[0] ?? null,
      bestMonthRevenue: bestMonthEntry ? Math.round(bestMonthEntry[1].revenue) : 0,
      bestYear: bestYearEntry?.[0] ?? null,
      bestYearRevenue: bestYearEntry ? Math.round(bestYearEntry[1].revenue) : 0,
    },
    availableYears,
    yearlyRevenue,
    monthlyRevenue: chartMonthlyRevenue,
    topCropsOverall: aggregateCrops(allRecords).slice(0, 5),
    topCropsForPeriod: aggregateCrops(periodRecords).slice(0, 5),
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

export async function exportFarmerSalesCsv(userId: string, query: FarmerSalesExportQuery = {}) {
  const farmer = await getFarmerByUserId(userId)

  const where: Prisma.SalesRecordWhereInput = { farmerId: farmer.id }
  if (query.year) {
    where.soldAt = soldAtRange(query.year, query.month)
  }

  const records = await prisma.salesRecord.findMany({
    where,
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

  const slug = farmer.name.replace(/\s+/g, '-').toLowerCase()
  let periodSuffix = 'all'
  if (query.year && query.month) {
    periodSuffix = `${query.year}-${String(query.month).padStart(2, '0')}`
  } else if (query.year) {
    periodSuffix = String(query.year)
  }

  return {
    filename: `namma-sandhai-sales-${slug}-${periodSuffix}.csv`,
    content: csv,
  }
}
