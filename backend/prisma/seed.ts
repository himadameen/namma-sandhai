import {
  PrismaClient,
  UserRole,
  BuyerType,
  ListingStatus,
  PurchaseRequestStatus,
  OrderStatus,
  DeliveryType,
  NotificationType,
  Language,
  AdminPermission,
  EnquiryStatus,
  Prisma,
} from '@prisma/client'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'Demo@2026'
const DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Erode',
  'Tiruchirappalli',
  'Thanjavur',
  'Tiruppur',
  'Dindigul',
  'Krishnagiri',
  'Dharmapuri',
  'Vellore',
  'Tiruvannamalai',
  'Cuddalore',
  'Villupuram',
  'Namakkal',
  'Karur',
]

const CROPS = [
  { name: 'Tomato', nameTamil: 'தக்காளி', category: 'Vegetable', unit: 'kg' },
  { name: 'Onion', nameTamil: 'வெங்காயம்', category: 'Vegetable', unit: 'kg' },
  { name: 'Brinjal', nameTamil: 'கத்தரி', category: 'Vegetable', unit: 'kg' },
  { name: 'Cabbage', nameTamil: 'முட்டைக்கோஸ்', category: 'Vegetable', unit: 'kg' },
  { name: 'Cauliflower', nameTamil: 'பூக்கோஸ்', category: 'Vegetable', unit: 'kg' },
  { name: "Lady's Finger", nameTamil: 'வெண்டைக்காய்', category: 'Vegetable', unit: 'kg' },
  { name: 'Green Chilli', nameTamil: 'பச்சை மிளகாய்', category: 'Vegetable', unit: 'kg' },
  { name: 'Potato', nameTamil: 'உருளைக்கிழங்கு', category: 'Vegetable', unit: 'kg' },
  { name: 'Banana', nameTamil: 'வாழைப்பழம்', category: 'Fruit', unit: 'dozen' },
  { name: 'Mango', nameTamil: 'மாம்பழம்', category: 'Fruit', unit: 'kg' },
  { name: 'Coconut', nameTamil: 'தேங்காய்', category: 'Plantation', unit: 'piece' },
  { name: 'Turmeric', nameTamil: 'மஞ்சள்', category: 'Spice', unit: 'kg' },
  { name: 'Groundnut', nameTamil: 'நிலக்கடலை', category: 'Pulse', unit: 'kg' },
  { name: 'Paddy', nameTamil: 'நெல்', category: 'Cereal', unit: 'quintal' },
  { name: 'Sugarcane', nameTamil: 'கரும்பு', category: 'Cash Crop', unit: 'tonne' },
]

const FARMER_NAMES = [
  { name: 'Murugan', nameTamil: 'முருகன்', farm: 'Murugan Organic Farms', district: 'Krishnagiri' },
  { name: 'Rajesh', nameTamil: 'ராஜேஷ்', farm: 'Rajesh Agro Farm', district: 'Salem' },
  { name: 'Ganesan', nameTamil: 'கணேசன்', farm: 'Ganesan Greens', district: 'Erode' },
  { name: 'Selvam', nameTamil: 'செல்வம்', farm: 'Selvam Harvest', district: 'Madurai' },
  { name: 'Balu', nameTamil: 'பாலு', farm: 'Balu Family Farm', district: 'Thanjavur' },
  { name: 'Kumar', nameTamil: 'குமார்', farm: 'Kumar Fresh Produce', district: 'Coimbatore' },
  { name: 'Ramesh', nameTamil: 'ரமேஷ்', farm: 'Ramesh Valley Farm', district: 'Dindigul' },
  { name: 'Vijay', nameTamil: 'விஜய்', farm: 'Vijay Agro Estate', district: 'Tiruppur' },
  { name: 'Suresh', nameTamil: 'சுரேஷ்', farm: 'Suresh Organic', district: 'Namakkal' },
  { name: 'Arun', nameTamil: 'அருண்', farm: 'Arun Farm Fresh', district: 'Karur' },
  { name: 'Mahesh', nameTamil: 'மகேஷ்', farm: 'Mahesh Greens', district: 'Dharmapuri' },
  { name: 'Santhosh', nameTamil: 'சந்தோஷ்', farm: 'Santhosh Farms', district: 'Vellore' },
  { name: 'Prakash', nameTamil: 'பிரகாஷ்', farm: 'Prakash Agro', district: 'Tiruvannamalai' },
  { name: 'Natarajan', nameTamil: 'நடராஜன்', farm: 'Natarajan Produce', district: 'Cuddalore' },
  { name: 'Siva', nameTamil: 'சிவா', farm: 'Siva Organic Farm', district: 'Villupuram' },
]

const BUYER_ORGS = [
  { name: 'ABC Fresh Mart', org: 'ABC Fresh Mart', district: 'Chennai', type: BuyerType.RETAILER },
  { name: 'Chennai Wholesale Hub', org: 'Chennai Wholesale Hub', district: 'Chennai', type: BuyerType.WHOLESALER },
  { name: 'Coimbatore Agro Traders', org: 'Coimbatore Agro Traders', district: 'Coimbatore', type: BuyerType.WHOLESALER },
  { name: 'Madurai Food Processors', org: 'Madurai Food Processors', district: 'Madurai', type: BuyerType.PROCESSOR },
  { name: 'Salem Retail Chain', org: 'Salem Retail Chain', district: 'Salem', type: BuyerType.RETAILER },
  { name: 'Spice Route Restaurant Group', org: 'Spice Route Restaurants', district: 'Chennai', type: BuyerType.RESTAURANT },
  { name: 'Thanjavur Market Link', org: 'Thanjavur Market Link', district: 'Thanjavur', type: BuyerType.WHOLESALER },
  { name: 'Erode Veg Exports', org: 'Erode Veg Exports', district: 'Erode', type: BuyerType.OTHER },
]

const CROP_IMAGES: Record<string, string> = {
  Tomato: 'https://images.unsplash.com/photo-1592924356588-8e497d3754c0?w=800&q=80',
  Onion: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  Brinjal: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80',
  Mango: 'https://images.unsplash.com/photo-1553279768-8654fa4cbf6f?w=800&q=80',
  Banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
  Potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80'

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

function cropImage(name: string) {
  return CROP_IMAGES[name] ?? DEFAULT_IMAGE
}

function buildListingMedia(urls: string[]): Prisma.InputJsonValue {
  return urls.map((url, index) => ({
    id: `seed-media-${index}-${Buffer.from(url).toString('base64url').slice(0, 8)}`,
    url,
    type: 'image',
    name: `produce-${index + 1}.jpg`,
  }))
}

function galleryUrlsForCrop(cropName: string, count: number): string[] {
  const primary = cropImage(cropName)
  const pool = [primary, ...PRODUCE_GALLERY.filter((url) => url !== primary)]
  return pool.slice(0, count)
}

async function applyListingMedia(
  listingId: string,
  cropName: string,
  count: number
) {
  const urls = galleryUrlsForCrop(cropName, count)
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      media: buildListingMedia(urls),
      imageUrl: urls[0],
    },
  })
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100
}

async function main() {
  console.log('🌾 Seeding Namma Sandhai database...')

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  // Clear existing data
  await prisma.listingQuantitySnapshot.deleteMany()
  await prisma.supportEnquiry.deleteMany()
  await prisma.profileDocument.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.salesRecord.deleteMany()
  await prisma.order.deleteMany()
  await prisma.purchaseRequest.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.marketPrice.deleteMany()
  await prisma.crop.deleteMany()
  await prisma.farmer.deleteMany()
  await prisma.buyer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.adminRole.deleteMany()

  // Crops
  const crops = await Promise.all(
    CROPS.map((crop) => prisma.crop.create({ data: crop }))
  )
  console.log(`  ✓ ${crops.length} crops`)

  const tomato = crops.find((c) => c.name === 'Tomato')!

  // Demo accounts
  const demoFarmerUser = await prisma.user.create({
    data: {
      email: 'farmer@nammasandhai.demo',
      password: passwordHash,
      role: UserRole.FARMER,
      farmer: {
        create: {
          name: 'Murugan',
          nameTamil: 'முருகன்',
          phone: '9876543210',
          email: 'farmer@nammasandhai.demo',
          district: 'Krishnagiri',
          state: 'Tamil Nadu',
          farmSize: '5 acres',
          cropsGrown: 'Tomato, Onion, Brinjal',
          address: 'Krishnagiri Main Road, Tamil Nadu',
          language: Language.en,
          isVerified: true,
        },
      },
    },
    include: { farmer: true },
  })

  const demoBuyerUser = await prisma.user.create({
    data: {
      email: 'buyer@nammasandhai.demo',
      password: passwordHash,
      role: UserRole.BUYER,
      buyer: {
        create: {
          name: 'ABC Fresh Mart',
          phone: '9876543211',
          email: 'buyer@nammasandhai.demo',
          organization: 'ABC Fresh Mart',
          district: 'Chennai',
          state: 'Tamil Nadu',
          buyerType: BuyerType.RETAILER,
          address: 'Anna Nagar, Chennai',
          language: Language.en,
          isVerified: true,
        },
      },
    },
    include: { buyer: true },
  })

  const superAdminRole = await prisma.adminRole.create({
    data: {
      name: 'Super Admin',
      description: 'Full platform access',
      permissions: Object.values(AdminPermission),
      isSystem: true,
    },
  })

  await prisma.adminRole.create({
    data: {
      name: 'Support Manager',
      description: 'Manage enquiries and view transactions',
      permissions: [
        AdminPermission.ENQUIRIES_MANAGE,
        AdminPermission.TRANSACTIONS_VIEW,
        AdminPermission.USERS_MANAGE,
        AdminPermission.KYC_REVIEW,
      ],
      isSystem: false,
    },
  })

  await prisma.user.create({
    data: {
      email: 'admin@nammasandhai.demo',
      password: passwordHash,
      role: UserRole.ADMIN,
      adminRoleId: superAdminRole.id,
      name: 'Platform Admin',
      phone: '9876543210',
      language: Language.en,
    },
  })

  // Additional farmers (14 more + demo = 15)
  const farmers = [demoFarmerUser.farmer!]
  for (let i = 1; i < FARMER_NAMES.length; i++) {
    const f = FARMER_NAMES[i]
    const user = await prisma.user.create({
      data: {
        email: `farmer${i + 1}@nammasandhai.demo`,
        password: passwordHash,
        role: UserRole.FARMER,
        farmer: {
          create: {
            name: f.name,
            nameTamil: f.nameTamil,
            phone: `98765${String(43210 + i).slice(-5)}`,
            email: `farmer${i + 1}@nammasandhai.demo`,
            district: f.district,
            state: 'Tamil Nadu',
            farmSize: `${randomBetween(2, 20)} acres`,
            cropsGrown: CROPS.slice(i % 5, (i % 5) + 3)
              .map((c) => c.name)
              .join(', '),
            language: Language.ta,
            isVerified: i % 3 !== 0,
          },
        },
      },
      include: { farmer: true },
    })
    farmers.push(user.farmer!)
  }
  console.log(`  ✓ ${farmers.length} farmers`)

  // Buyers (7 more + demo = 8)
  const buyers = [demoBuyerUser.buyer!]
  for (let i = 1; i < BUYER_ORGS.length; i++) {
    const b = BUYER_ORGS[i]
    const user = await prisma.user.create({
      data: {
        email: `buyer${i + 1}@nammasandhai.demo`,
        password: passwordHash,
        role: UserRole.BUYER,
        buyer: {
          create: {
            name: b.name,
            phone: `87654${String(32100 + i).slice(-5)}`,
            email: `buyer${i + 1}@nammasandhai.demo`,
            organization: b.org,
            district: b.district,
            state: 'Tamil Nadu',
            buyerType: b.type,
            language: Language.en,
            isVerified: i % 2 === 0,
          },
        },
      },
      include: { buyer: true },
    })
    buyers.push(user.buyer!)
  }
  console.log(`  ✓ ${buyers.length} buyers`)

  // Market prices (50 records)
  const marketPrices = []
  const tomatoDistricts = ['Krishnagiri', 'Chennai', 'Coimbatore', 'Madurai', 'Salem']
  for (let day = 0; day < 7; day++) {
    for (const district of tomatoDistricts) {
      const yesterdayPrice = 40
      const todayPrice = 50
      const districtBias = district === 'Krishnagiri' ? 0 : 2
      const averagePrice =
        (day === 0 ? todayPrice : day === 1 ? yesterdayPrice : 40 + day * 0.8) + districtBias
      marketPrices.push(
        await prisma.marketPrice.create({
          data: {
            cropId: tomato.id,
            district,
            marketName: `${district} Regulated Market`,
            date: daysAgo(day),
            minPrice: averagePrice - 4,
            maxPrice: averagePrice + 4,
            averagePrice,
            unit: 'kg',
          },
        })
      )
    }
  }
  // Fill remaining with other crops
  for (let i = marketPrices.length; i < 50; i++) {
    const crop = crops[i % crops.length]
    marketPrices.push(
      await prisma.marketPrice.create({
        data: {
          cropId: crop.id,
          district: DISTRICTS[i % DISTRICTS.length],
          marketName: `${DISTRICTS[i % DISTRICTS.length]} Market`,
          date: daysAgo(i % 7),
          minPrice: randomBetween(20, 80),
          maxPrice: randomBetween(85, 150),
          averagePrice: randomBetween(50, 100),
          unit: crop.unit,
        },
      })
    )
  }
  console.log(`  ✓ ${marketPrices.length} market prices`)

  // Listings (30)
  const listings = []
  for (let i = 0; i < 30; i++) {
    const farmer = farmers[i % farmers.length]
    const crop = crops[i % crops.length]
    listings.push(
      await prisma.listing.create({
        data: {
          farmerId: farmer.id,
          cropId: crop.id,
          variety: i % 2 === 0 ? 'Local' : 'Hybrid',
          quantity: randomBetween(100, 2000),
          unit: crop.unit,
          expectedPrice: randomBetween(25, 60),
          district: farmer.district,
          state: 'Tamil Nadu',
          harvestDate: daysAgo(-randomBetween(1, 14)),
          availableFrom: daysAgo(0),
          availableUntil: daysAgo(-30),
          description: `Fresh ${crop.name} from ${farmer.name}`,
          imageUrl: cropImage(crop.name),
          status: i < 25 ? ListingStatus.ACTIVE : ListingStatus.SOLD,
        },
      })
    )
  }
  console.log(`  ✓ ${listings.length} listings`)

  // Purchase requests (10)
  const purchaseRequests = []
  for (let i = 0; i < 10; i++) {
    const listing = listings[i]
    const buyer = buyers[i % buyers.length]
    purchaseRequests.push(
      await prisma.purchaseRequest.create({
        data: {
          listingId: listing.id,
          buyerId: buyer.id,
          quantity: Math.min(listing.quantity * 0.4, 500),
          offeredPrice: listing.expectedPrice + randomBetween(-2, 3),
          deliveryType: i % 2 === 0 ? DeliveryType.DELIVERY : DeliveryType.PICKUP,
          message: `Interested in purchasing ${listing.quantity} ${listing.unit}`,
          status:
            i < 5
              ? PurchaseRequestStatus.PENDING
              : i < 7
                ? PurchaseRequestStatus.ACCEPTED
                : i < 9
                  ? PurchaseRequestStatus.REJECTED
                  : PurchaseRequestStatus.COUNTERED,
        },
      })
    )
  }
  console.log(`  ✓ ${purchaseRequests.length} purchase requests`)

  // Orders (8) from accepted requests
  const orders = []
  const acceptedRequests = purchaseRequests.filter(
    (pr) => pr.status === PurchaseRequestStatus.ACCEPTED
  )
  for (let i = 0; i < 8; i++) {
    const listing = listings[i + 5]
    const buyer = buyers[i % buyers.length]
    const farmer = farmers.find((f) => f.id === listing.farmerId)!
    const qty = Math.min(listing.quantity * 0.3, 300)
    const price = listing.expectedPrice

    let purchaseRequest = acceptedRequests[i]
    if (!purchaseRequest) {
      purchaseRequest = await prisma.purchaseRequest.create({
        data: {
          listingId: listing.id,
          buyerId: buyer.id,
          quantity: qty,
          offeredPrice: price,
          deliveryType: DeliveryType.DELIVERY,
          status: PurchaseRequestStatus.ACCEPTED,
        },
      })
    }

    const totalAmount = purchaseRequest.quantity * purchaseRequest.offeredPrice
    const orderStatus =
      i < 3
        ? OrderStatus.COMPLETED
        : i < 5
          ? OrderStatus.IN_TRANSIT
          : i < 7
            ? OrderStatus.CONFIRMED
            : OrderStatus.PENDING_CONFIRMATION

    orders.push(
      await prisma.order.create({
        data: {
          purchaseRequestId: purchaseRequest.id,
          listingId: listing.id,
          buyerId: buyer.id,
          farmerId: farmer.id,
          quantity: purchaseRequest.quantity,
          agreedPrice: purchaseRequest.offeredPrice,
          totalAmount,
          deliveryType: purchaseRequest.deliveryType,
          status: orderStatus,
        },
      })
    )
  }
  console.log(`  ✓ ${orders.length} orders`)

  // Sales records for completed orders
  let salesCount = 0
  for (const order of orders.filter((o) => o.status === OrderStatus.COMPLETED)) {
    const listing = listings.find((l) => l.id === order.listingId)!
    const buyer = buyers.find((b) => b.id === order.buyerId)!
    await prisma.salesRecord.create({
      data: {
        orderId: order.id,
        farmerId: order.farmerId,
        cropId: listing.cropId,
        buyerName: buyer.organization ?? buyer.name,
        quantity: order.quantity,
        unit: listing.unit,
        price: order.agreedPrice,
        totalAmount: order.totalAmount,
        status: OrderStatus.COMPLETED,
        soldAt: daysAgo(randomBetween(1, 30)),
      },
    })
    salesCount++
  }
  console.log(`  ✓ ${salesCount} sales records`)

  // Notifications
  const notifications = [
    {
      userId: demoFarmerUser.id,
      title: 'New purchase request',
      message: 'New purchase request from Chennai Fresh Mart for Tomato',
      type: NotificationType.PURCHASE_REQUEST,
    },
    {
      userId: demoBuyerUser.id,
      title: 'Request accepted',
      message: 'Your request for Tomato has been accepted',
      type: NotificationType.REQUEST_ACCEPTED,
    },
    {
      userId: demoFarmerUser.id,
      title: 'Order completed',
      message: 'Order is now completed',
      type: NotificationType.ORDER_UPDATE,
    },
    {
      userId: demoFarmerUser.id,
      title: 'Welcome to Namma Sandhai',
      message: 'Your farmer account is verified and ready to use',
      type: NotificationType.VERIFICATION,
    },
  ]

  for (const n of notifications) {
    await prisma.notification.create({ data: n })
  }

  // Extra notifications for other users
  for (let i = 0; i < 6; i++) {
    const user = i % 2 === 0 ? farmers[i % farmers.length] : buyers[i % buyers.length]
    const userId =
      i % 2 === 0
        ? (await prisma.user.findFirst({ where: { farmer: { id: (user as typeof farmers[0]).id } } }))!.id
        : (await prisma.user.findFirst({ where: { buyer: { id: (user as typeof buyers[0]).id } } }))!.id

    await prisma.notification.create({
      data: {
        userId,
        title: 'Market price update',
        message: `Tomato prices updated for ${DISTRICTS[i % DISTRICTS.length]}`,
        type: NotificationType.GENERAL,
      },
    })
  }
  console.log(`  ✓ notifications seeded`)

  // Hackathon demo scenario — featured Krishnagiri Tomato listing for demo farmer
  const demoFarmer = demoFarmerUser.farmer!
  const demoTomatoListing = await prisma.listing.create({
    data: {
      farmerId: demoFarmer.id,
      cropId: tomato.id,
      variety: 'Hybrid',
      quantity: 500,
      unit: 'kg',
      expectedPrice: 42,
      district: 'Krishnagiri',
      state: 'Tamil Nadu',
      harvestDate: daysAgo(-2),
      availableFrom: daysAgo(0),
      availableUntil: daysAgo(-14),
      description: 'Premium Krishnagiri tomatoes — fresh harvest, ideal for retail & wholesale',
      imageUrl: cropImage('Tomato'),
      status: ListingStatus.ACTIVE,
    },
  })

  await applyListingMedia(demoTomatoListing.id, 'Tomato', 4)

  // Pending request from another buyer (demo buyer can still send a fresh request)
  await prisma.purchaseRequest.create({
    data: {
      listingId: demoTomatoListing.id,
      buyerId: buyers[1].id,
      quantity: 150,
      offeredPrice: 40,
      deliveryType: DeliveryType.DELIVERY,
      message: 'Weekly retail supply needed from Krishnagiri',
      status: PurchaseRequestStatus.PENDING,
    },
  })

  // Completed sale history for demo farmer dashboard
  const demoPastRequest = await prisma.purchaseRequest.create({
    data: {
      listingId: demoTomatoListing.id,
      buyerId: demoBuyerUser.buyer!.id,
      quantity: 200,
      offeredPrice: 42,
      deliveryType: DeliveryType.DELIVERY,
      message: 'Previous order — demo sales record',
      status: PurchaseRequestStatus.ACCEPTED,
    },
  })

  const demoPastOrder = await prisma.order.create({
    data: {
      purchaseRequestId: demoPastRequest.id,
      listingId: demoTomatoListing.id,
      buyerId: demoBuyerUser.buyer!.id,
      farmerId: demoFarmer.id,
      quantity: 200,
      agreedPrice: 42,
      totalAmount: 8400,
      deliveryType: DeliveryType.DELIVERY,
      status: OrderStatus.COMPLETED,
    },
  })

  await prisma.salesRecord.create({
    data: {
      orderId: demoPastOrder.id,
      farmerId: demoFarmer.id,
      cropId: tomato.id,
      buyerName: 'ABC Fresh Mart',
      quantity: 200,
      unit: 'kg',
      price: 42,
      totalAmount: 8400,
      status: OrderStatus.COMPLETED,
      soldAt: daysAgo(12),
    },
  })

  // Rich demo dataset for farmer dashboard (20+ records)
  const demoListings = []
  for (let i = 0; i < 20; i++) {
    const crop = crops[i % crops.length]
    demoListings.push(
      await prisma.listing.create({
        data: {
          farmerId: demoFarmer.id,
          cropId: crop.id,
          variety: i % 3 === 0 ? 'Hybrid' : i % 3 === 1 ? 'Local' : 'Premium',
          quantity: randomBetween(150, 1800),
          unit: crop.unit,
          expectedPrice: randomBetween(28, 65),
          district: 'Krishnagiri',
          state: 'Tamil Nadu',
          harvestDate: daysAgo(-randomBetween(1, 10)),
          availableFrom: daysAgo(randomBetween(0, 3)),
          availableUntil: daysAgo(-randomBetween(10, 25)),
          description: `Fresh ${crop.name} from Murugan Organic Farms — batch ${i + 1}`,
          imageUrl: cropImage(crop.name),
          status: i < 16 ? ListingStatus.ACTIVE : ListingStatus.SOLD,
        },
      })
    )
  }

  const demoMediaVariants = [
    { listing: demoListings[19], count: 4 },
    { listing: demoListings[18], count: 3 },
    { listing: demoListings[17], count: 3 },
    { listing: demoListings[16], count: 2 },
  ]

  for (const { listing, count } of demoMediaVariants) {
    const crop = crops.find((c) => c.id === listing.cropId)!
    await applyListingMedia(listing.id, crop.name, count)
  }

  let demoSalesCreated = 0
  for (let i = 0; i < 20; i++) {
    const crop = crops[i % crops.length]
    const buyer = buyers[i % buyers.length]
    const listing = demoListings[i % demoListings.length]
    const qty = randomBetween(80, 450)
    const price = randomBetween(30, 58)
    const totalAmount = Math.round(qty * price)

    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        listingId: listing.id,
        buyerId: buyer.id,
        quantity: qty,
        offeredPrice: price,
        deliveryType: i % 2 === 0 ? DeliveryType.DELIVERY : DeliveryType.PICKUP,
        message: `Demo purchase batch ${i + 1}`,
        status: PurchaseRequestStatus.ACCEPTED,
      },
    })

    const order = await prisma.order.create({
      data: {
        purchaseRequestId: purchaseRequest.id,
        listingId: listing.id,
        buyerId: buyer.id,
        farmerId: demoFarmer.id,
        quantity: qty,
        agreedPrice: price,
        totalAmount,
        deliveryType: purchaseRequest.deliveryType,
        status:
          i < 14
            ? OrderStatus.COMPLETED
            : i < 17
              ? OrderStatus.IN_TRANSIT
              : i < 19
                ? OrderStatus.CONFIRMED
                : OrderStatus.PENDING_CONFIRMATION,
      },
    })

    if (order.status === OrderStatus.COMPLETED) {
      await prisma.salesRecord.create({
        data: {
          orderId: order.id,
          farmerId: demoFarmer.id,
          cropId: crop.id,
          buyerName: buyer.organization ?? buyer.name,
          quantity: qty,
          unit: crop.unit,
          price,
          totalAmount,
          status: OrderStatus.COMPLETED,
          soldAt: daysAgo(randomBetween(3, 180)),
        },
      })
      demoSalesCreated++
    }
  }

  // Pending requests on demo farmer listings
  for (let i = 0; i < 6; i++) {
    await prisma.purchaseRequest.create({
      data: {
        listingId: demoListings[i].id,
        buyerId: buyers[(i + 2) % buyers.length].id,
        quantity: randomBetween(50, 200),
        offeredPrice: demoListings[i].expectedPrice + randomBetween(-3, 2),
        deliveryType: DeliveryType.DELIVERY,
        message: `Pending demo request ${i + 1}`,
        status: i % 2 === 0 ? PurchaseRequestStatus.PENDING : PurchaseRequestStatus.COUNTERED,
      },
    })
  }

  console.log(`  ✓ demo farmer rich data (${demoListings.length} listings, ${demoSalesCreated} sales)`)
  console.log('  ✓ demo media variants (4 / 3 / 3 / 2 images on sample listings)')

  console.log(`  ✓ demo scenario (Tomato listing: ${demoTomatoListing.id})`)

  await prisma.supportEnquiry.createMany({
    data: [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '9876543210',
        subject: 'Payment not received for completed order',
        message: 'I completed an order last week but payment is still pending. Order reference needed.',
        status: EnquiryStatus.OPEN,
      },
      {
        name: demoFarmerUser.farmer!.name,
        email: demoFarmerUser.email,
        userId: demoFarmerUser.id,
        subject: 'KYC document verification delay',
        message: 'I uploaded my land records 5 days ago. Please review my KYC documents.',
        status: EnquiryStatus.IN_PROGRESS,
        adminNotes: 'Documents under review',
      },
      {
        name: 'Priya Traders',
        email: 'priya@traders.in',
        subject: 'Bulk tomato enquiry',
        message: 'Looking for 2000 kg tomato weekly supply from Krishnagiri region.',
        status: EnquiryStatus.RESOLVED,
        adminReply: 'Connected you with verified farmers in Krishnagiri. Check your email.',
        resolvedAt: new Date(),
      },
    ],
  })

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  const activeListings = await prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE },
    select: { id: true, cropId: true, quantity: true },
  })
  if (activeListings.length > 0) {
    await prisma.listingQuantitySnapshot.createMany({
      data: activeListings.map((l, i) => ({
        listingId: l.id,
        cropId: l.cropId,
        quantity: l.quantity + (i % 3 === 0 ? 50 : i % 3 === 1 ? -30 : 0),
        date: yesterday,
      })),
      skipDuplicates: true,
    })
  }

  console.log('\n✅ Seed complete!')
  console.log('\nDemo accounts (password: Demo@2026):')
  console.log('  farmer@nammasandhai.demo  (Farmer — Murugan)')
  console.log('  buyer@nammasandhai.demo   (Buyer — ABC Fresh Mart)')
  console.log('  admin@nammasandhai.demo   (Admin)')
  console.log(`\nFeatured demo listing: /marketplace/${demoTomatoListing.id}`)
  console.log('  Crop: Tomato · Krishnagiri · ₹42/kg · 500 kg')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
