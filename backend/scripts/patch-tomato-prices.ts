import prisma from '../src/config/database'

function dayOffset(n: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

async function setPrice(cropId: string, district: string, date: Date, averagePrice: number) {
  const existing = await prisma.marketPrice.findFirst({
    where: { cropId, district, date },
  })
  const data = {
    minPrice: averagePrice - 4,
    maxPrice: averagePrice + 4,
    averagePrice,
    unit: 'kg',
    marketName: `${district} Regulated Market`,
  }

  if (existing) {
    await prisma.marketPrice.update({ where: { id: existing.id }, data })
    return
  }

  await prisma.marketPrice.create({
    data: { cropId, district, date, ...data },
  })
}

async function main() {
  const tomato = await prisma.crop.findFirst({ where: { name: 'Tomato' } })
  if (!tomato) {
    console.log('Tomato crop not found')
    return
  }

  const districts = ['Krishnagiri', 'Chennai', 'Coimbatore', 'Madurai', 'Salem']
  for (const district of districts) {
    await setPrice(tomato.id, district, dayOffset(0), 50)
    await setPrice(tomato.id, district, dayOffset(1), 40)
  }

  console.log('Tomato market: yesterday ₹40 → today ₹50')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
