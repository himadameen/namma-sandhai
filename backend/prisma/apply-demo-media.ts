/**
 * Applies multi-image demo media to the newest demo-farmer listings
 * without wiping the database. Run: npx tsx prisma/apply-demo-media.ts
 */
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const PRODUCE_GALLERY = [
  'https://images.unsplash.com/photo-1592924356588-8e497d3754c0?w=800&q=80',
  'https://images.unsplash.com/photo-1546094097-2d62a7a2a5df?w=800&q=80',
  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
  'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80',
  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'https://images.unsplash.com/photo-1553279768-8654fa4cbf6f?w=800&q=80',
  'https://images.unsplash.com/photo-1464226184884-fa280b87f399?w=800&q=80',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
]

const CROP_IMAGES: Record<string, string> = {
  Tomato: 'https://images.unsplash.com/photo-1592924356588-8e497d3754c0?w=800&q=80',
  Onion: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  Brinjal: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80',
  Mango: 'https://images.unsplash.com/photo-1553279768-8654fa4cbf6f?w=800&q=80',
  Banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
  Potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  Cauliflower: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80'

function galleryUrls(cropName: string, count: number) {
  const primary = CROP_IMAGES[cropName] ?? DEFAULT_IMAGE
  const pool = [primary, ...PRODUCE_GALLERY.filter((url) => url !== primary)]
  return pool.slice(0, count)
}

function buildMedia(urls: string[]) {
  return urls.map((url, index) => ({
    id: `demo-media-${index}-${url.slice(-12).replace(/\W/g, '')}`,
    url,
    type: 'image',
    name: `produce-${index + 1}.jpg`,
  }))
}

async function main() {
  const farmer = await prisma.farmer.findFirst({
    where: { email: 'farmer@nammasandhai.demo' },
  })

  if (!farmer) {
    console.error('Demo farmer not found. Run prisma/seed.ts first.')
    process.exit(1)
  }

  const listings = await prisma.listing.findMany({
    where: { farmerId: farmer.id },
    include: { crop: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  const counts = [4, 3, 3, 2]

  for (let i = 0; i < listings.length && i < counts.length; i++) {
    const listing = listings[i]
    const urls = galleryUrls(listing.crop.name, counts[i])
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        media: buildMedia(urls),
        imageUrl: urls[0],
      },
    })
    console.log(`  ✓ ${listing.crop.name} (${listing.variety ?? '—'}): ${counts[i]} images`)
  }

  console.log('\nDone. Refresh My Product page to see multiple images on the top listings.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
