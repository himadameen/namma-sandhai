import prisma from '../config/database'

export async function getAllCrops() {
  return prisma.crop.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      nameTamil: true,
      category: true,
      unit: true,
    },
  })
}

export async function findCropByNameOrId(crop?: string, cropId?: string) {
  if (cropId) {
    return prisma.crop.findUnique({ where: { id: cropId } })
  }
  if (crop) {
    return prisma.crop.findFirst({
      where: { name: { equals: crop, mode: 'insensitive' } },
    })
  }
  return null
}
