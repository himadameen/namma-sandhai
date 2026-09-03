import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { formatSalesRecord } from './dashboard.service'

async function getFarmerByUserId(userId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) throw new AppError(404, 'Farmer profile not found')
  return farmer
}

export async function getFarmerSalesRecords(userId: string) {
  const farmer = await getFarmerByUserId(userId)

  const records = await prisma.salesRecord.findMany({
    where: { farmerId: farmer.id },
    include: {
      crop: { select: { id: true, name: true, nameTamil: true, unit: true } },
    },
    orderBy: { soldAt: 'desc' },
  })

  const totalRevenue = records.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0)

  return {
    records: records.map(formatSalesRecord),
    summary: {
      totalRecords: records.length,
      totalRevenue: Math.round(totalRevenue),
      totalQuantity: Math.round(totalQuantity * 100) / 100,
    },
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
