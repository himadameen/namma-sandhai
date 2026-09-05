import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { findCropByNameOrId } from './crop.service'
import type { MarketPriceQuery, MarketTrendQuery } from '../validators/market.validator'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function parseDate(value: string): Date {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new AppError(400, 'Invalid date format')
  }
  return startOfDay(d)
}

export async function getMarketPrices(query: MarketPriceQuery) {
  const crop = await findCropByNameOrId(query.crop, query.cropId)

  const where: {
    cropId?: string
    district?: string
    date?: { gte?: Date; lte?: Date }
  } = {}

  if (crop) where.cropId = crop.id
  if (query.district) where.district = query.district
  if (query.dateFrom || query.dateTo) {
    where.date = {}
    if (query.dateFrom) where.date.gte = parseDate(query.dateFrom)
    if (query.dateTo) where.date.lte = parseDate(query.dateTo)
  }

  const prices = await prisma.marketPrice.findMany({
    where,
    include: {
      crop: {
        select: { id: true, name: true, nameTamil: true, unit: true, category: true },
      },
    },
    orderBy: [{ date: 'desc' }, { district: 'asc' }],
  })

  const latestDate = prices[0]?.date
  const latestDayPrices = latestDate
    ? prices.filter((p) => p.date.getTime() === latestDate.getTime())
    : []

  const summary =
    latestDayPrices.length > 0
      ? {
          date: latestDate,
          minPrice: Math.min(...latestDayPrices.map((p) => p.minPrice)),
          maxPrice: Math.max(...latestDayPrices.map((p) => p.maxPrice)),
          averagePrice:
            Math.round(
              (latestDayPrices.reduce((sum, p) => sum + p.averagePrice, 0) /
                latestDayPrices.length) *
                100
            ) / 100,
          unit: latestDayPrices[0].unit,
          crop: latestDayPrices[0].crop,
          district: query.district ?? latestDayPrices[0].district,
          recordCount: latestDayPrices.length,
        }
      : null

  return { prices, summary }
}

export async function getMarketTrend(query: MarketTrendQuery, farmerUserId?: string) {
  const crop = await findCropByNameOrId(query.crop, query.cropId)
  if (!crop) {
    throw new AppError(404, 'Crop not found')
  }

  const endDate = startOfDay(new Date())
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (query.days - 1))

  const prices = await prisma.marketPrice.findMany({
    where: {
      cropId: crop.id,
      district: query.district,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  })

  const trendMap = new Map<string, { date: Date; minPrice: number; maxPrice: number; averagePrice: number; unit: string }>()

  for (const price of prices) {
    const key = price.date.toISOString().slice(0, 10)
    trendMap.set(key, {
      date: price.date,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      averagePrice: price.averagePrice,
      unit: price.unit,
    })
  }

  const trend = Array.from(trendMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())

  const todayKey = endDate.toISOString().slice(0, 10)
  const todayEntry = trend.find((t) => t.date.toISOString().slice(0, 10) === todayKey)
    ?? trend[trend.length - 1]

  const priorEntries = trend.filter((t) => t.date.toISOString().slice(0, 10) !== todayKey)
  const previousAverage =
    priorEntries.length > 0
      ? priorEntries.reduce((sum, t) => sum + t.averagePrice, 0) / priorEntries.length
      : null

  let percentChange: number | null = null
  let direction: 'higher' | 'lower' | 'stable' | null = null

  if (todayEntry && previousAverage !== null && previousAverage > 0) {
    percentChange =
      Math.round(((todayEntry.averagePrice - previousAverage) / previousAverage) * 1000) / 10
    if (Math.abs(percentChange) < 0.5) direction = 'stable'
    else if (percentChange > 0) direction = 'higher'
    else direction = 'lower'
  }

  let farmerListingPrice: number | null = null
  if (farmerUserId) {
    const farmer = await prisma.farmer.findUnique({
      where: { userId: farmerUserId },
      include: {
        listings: {
          where: { cropId: crop.id, status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
    farmerListingPrice = farmer?.listings[0]?.expectedPrice ?? null
  }

  const listingComparison =
    todayEntry && farmerListingPrice !== null
      ? {
          listingPrice: farmerListingPrice,
          marketAverage: todayEntry.averagePrice,
          difference: Math.round((farmerListingPrice - todayEntry.averagePrice) * 100) / 100,
          percentVsMarket:
            Math.round(((farmerListingPrice - todayEntry.averagePrice) / todayEntry.averagePrice) * 1000) / 10,
        }
      : null

  return {
    crop: {
      id: crop.id,
      name: crop.name,
      nameTamil: crop.nameTamil,
      unit: crop.unit,
    },
    district: query.district,
    trend,
    summary: todayEntry
      ? {
          minPrice: todayEntry.minPrice,
          maxPrice: todayEntry.maxPrice,
          averagePrice: todayEntry.averagePrice,
          unit: todayEntry.unit,
          date: todayEntry.date,
        }
      : null,
    insight: todayEntry && previousAverage !== null
      ? {
          todayAverage: todayEntry.averagePrice,
          previousPeriodAverage: Math.round(previousAverage * 100) / 100,
          percentChange,
          direction,
        }
      : null,
  listingComparison,
  }
}

export type PriceMoveDirection = 'up' | 'down' | 'stable'

export interface DailyPriceMove {
  cropId: string
  cropName: string
  cropNameTamil: string
  district: string
  unit: string
  yesterdayPrice: number
  todayPrice: number
  change: number
  percentChange: number
  direction: PriceMoveDirection
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export async function getDailyPriceMoves(pairs?: { cropId: string; district: string }[]): Promise<DailyPriceMove[]> {
  const since = startOfDay(new Date())
  since.setDate(since.getDate() - 14)

  const prices = await prisma.marketPrice.findMany({
    where: {
      date: { gte: since },
      ...(pairs?.length
        ? { OR: pairs.map((pair) => ({ cropId: pair.cropId, district: pair.district })) }
        : {}),
    },
    include: {
      crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
    },
    orderBy: { date: 'desc' },
  })

  const grouped = new Map<string, typeof prices>()
  for (const price of prices) {
    const key = `${price.cropId}::${price.district}`
    const list = grouped.get(key) ?? []
    list.push(price)
    grouped.set(key, list)
  }

  const moves: DailyPriceMove[] = []

  for (const records of grouped.values()) {
    const byDate = new Map<string, { sum: number; count: number; unit: string; crop: (typeof records)[0]['crop']; district: string; cropId: string }>()
    for (const record of records) {
      const key = dateKey(record.date)
      const existing = byDate.get(key)
      if (existing) {
        existing.sum += record.averagePrice
        existing.count += 1
      } else {
        byDate.set(key, {
          sum: record.averagePrice,
          count: 1,
          unit: record.unit,
          crop: record.crop,
          district: record.district,
          cropId: record.cropId,
        })
      }
    }

    const days = Array.from(byDate.entries())
      .map(([day, value]) => ({
        day,
        average: Math.round((value.sum / value.count) * 100) / 100,
        unit: value.unit,
        crop: value.crop,
        district: value.district,
        cropId: value.cropId,
      }))
      .sort((a, b) => b.day.localeCompare(a.day))

    if (days.length < 2) continue

    const today = days[0]
    const yesterday = days[1]
    const change = Math.round((today.average - yesterday.average) * 100) / 100
    const percentChange =
      yesterday.average > 0 ? Math.round((change / yesterday.average) * 1000) / 10 : 0

    moves.push({
      cropId: today.cropId,
      cropName: today.crop.name,
      cropNameTamil: today.crop.nameTamil,
      district: today.district,
      unit: today.unit,
      yesterdayPrice: yesterday.average,
      todayPrice: today.average,
      change,
      percentChange,
      direction: Math.abs(change) < 0.5 ? 'stable' : change > 0 ? 'up' : 'down',
    })
  }

  return moves.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

