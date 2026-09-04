import { randomUUID } from 'crypto'

export type ListingMediaItem = {
  id: string
  url: string
  type: 'image' | 'video'
  name?: string
}

export function parseListingMedia(value: unknown, imageUrl?: string | null): ListingMediaItem[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is ListingMediaItem =>
          !!item &&
          typeof item === 'object' &&
          typeof (item as ListingMediaItem).url === 'string' &&
          ((item as ListingMediaItem).type === 'image' || (item as ListingMediaItem).type === 'video')
      )
      .map((item) => ({
        id: item.id || randomUUID(),
        url: item.url,
        type: item.type,
        name: item.name,
      }))
  }

  if (imageUrl) {
    return [{ id: 'legacy-cover', url: imageUrl, type: 'image' }]
  }

  return []
}

export function primaryImageUrl(media: ListingMediaItem[], fallback?: string | null) {
  return media.find((item) => item.type === 'image')?.url ?? fallback ?? null
}

export function normalizeMediaInput(
  media?: ListingMediaItem[],
  imageUrl?: string
): { media: ListingMediaItem[]; imageUrl: string | null } {
  const normalized = (media ?? []).slice(0, 8).map((item) => ({
    id: item.id || randomUUID(),
    url: item.url,
    type: item.type,
    name: item.name,
  }))

  return {
    media: normalized,
    imageUrl: primaryImageUrl(normalized, imageUrl ?? null),
  }
}
