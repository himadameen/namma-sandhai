import prisma from '../src/config/database'

function dayOffset(n: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

async function setPrice(
  cropId: string,
  district: string,
  date: Date,
  averagePrice: number,
  unit: string
) {
  const existing = await prisma.marketPrice.findFirst({
    where: { cropId, district, date },
  })
  const data = {
    minPrice: Math.max(1, Math.round((averagePrice - 4) * 100) / 100),
    maxPrice: Math.round((averagePrice + 4) * 100) / 100,
    averagePrice: Math.round(averagePrice * 100) / 100,
    unit,
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

const CROP_PRICE_BENCHMARKS: Record<
  string,
  { yesterday: number; today: number }
> = {
  Tomato: { yesterday: 40, today: 50 }, // User's explicit requirement (+₹10)
  Sugarcane: { yesterday: 46, today: 49 }, // +₹3
  Paddy: { yesterday: 31, today: 29 }, // -₹2
  Groundnut: { yesterday: 35, today: 38 }, // +₹3
  Onion: { yesterday: 34, today: 30 }, // -₹4
  Potato: { yesterday: 25, today: 28 }, // +₹3
  Banana: { yesterday: 45, today: 45 }, // Stable
  Turmeric: { yesterday: 98, today: 108 }, // +₹10
  Coconut: { yesterday: 25, today: 27 }, // +₹2
  'Green Chilli': { yesterday: 62, today: 55 }, // -₹7
  Brinjal: { yesterday: 32, today: 35 }, // +₹3
  Cabbage: { yesterday: 24, today: 22 }, // -₹2
  Cauliflower: { yesterday: 38, today: 42 }, // +₹4
  "Lady's Finger": { yesterday: 36, today: 32 }, // -₹4
  Mango: { yesterday: 75, today: 85 }, // +₹10
}

const DISTRICTS = [
  'Krishnagiri',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Erode',
  'Dindigul',
  'Thanjavur',
  'Tiruppur',
  'Namakkal',
]

async function main() {
  console.log('Seeding market price fluctuations (yesterday vs today)...')

  const crops = await prisma.crop.findMany()
  for (const crop of crops) {
    const benchmark = CROP_PRICE_BENCHMARKS[crop.name] ?? {
      yesterday: 40,
      today: 44,
    }

    for (const district of DISTRICTS) {
      // Small district variation (±1-2 rupees)
      const districtBias =
        district === 'Krishnagiri'
          ? 0
          : district === 'Chennai'
            ? 2
            : district === 'Salem'
              ? -1
              : 1

      const yesterdayPrice = Math.max(1, benchmark.yesterday + districtBias)
      const todayPrice = Math.max(1, benchmark.today + districtBias)

      await setPrice(crop.id, district, dayOffset(1), yesterdayPrice, crop.unit)
      await setPrice(crop.id, district, dayOffset(0), todayPrice, crop.unit)
    }
    console.log(
      `✓ ${crop.name}: yesterday ₹${benchmark.yesterday} → today ₹${benchmark.today}`
    )
  }

  console.log('Market prices seeded successfully!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
