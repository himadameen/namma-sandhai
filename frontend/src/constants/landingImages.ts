/** Stable Unsplash URLs for landing page imagery */
export const landingImages = {
  hero: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80&auto=format&fit=crop',
  heroFarmer: 'https://images.unsplash.com/photo-1592982537077-2457911420a4?w=600&q=80&auto=format&fit=crop',
  tomato: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80&auto=format&fit=crop',
  onion: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80&auto=format&fit=crop',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80&auto=format&fit=crop',
  market: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop',
  harvest: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80&auto=format&fit=crop',
  stepList: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop',
  stepPrice: 'https://images.unsplash.com/photo-1560493676-04071c5f467d?w=800&q=80&auto=format&fit=crop',
  stepConnect: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop',
  stepSell: 'https://images.unsplash.com/photo-1593113598332-cd288d649329?w=800&q=80&auto=format&fit=crop',
  farmerPortrait: 'https://images.unsplash.com/photo-1592982537077-2457911420a4?w=900&q=80&auto=format&fit=crop',
  buyerMarket: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80&auto=format&fit=crop',
} as const

export const stepImages = [
  landingImages.stepList,
  landingImages.stepPrice,
  landingImages.stepConnect,
  landingImages.stepSell,
] as const

export const galleryImages = [
  { src: landingImages.tomato, altKey: 'landing.galleryTomato' },
  { src: landingImages.onion, altKey: 'landing.galleryOnion' },
  { src: landingImages.rice, altKey: 'landing.galleryRice' },
  { src: landingImages.harvest, altKey: 'landing.galleryHarvest' },
] as const
