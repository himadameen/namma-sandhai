export interface ListingMediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  name?: string
}

export function resolveMediaUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/')) return url
  return `/${url}`
}

export function listingMediaItems(listing: {
  media?: ListingMediaItem[]
  imageUrl?: string | null
}): ListingMediaItem[] {
  if (listing.media?.length) return listing.media
  if (listing.imageUrl) {
    return [{ id: 'legacy-cover', url: listing.imageUrl, type: 'image' }]
  }
  return []
}
