import type { ListingMediaItem } from '@/utils/media'
import { resolveMediaUrl } from '@/utils/media'
import { ListingMediaImage } from '@/components/listings/ListingMediaImage'
import { ListingMediaVideo } from '@/components/listings/ListingMediaVideo'
import { ListingMediaPlaceholder } from '@/components/listings/ListingMediaPlaceholder'
import { cn } from '@/lib/utils'

interface ListingMediaCoverProps {
  media: ListingMediaItem[]
  alt: string
  className?: string
  placeholderLabel?: string
}

export function ListingMediaCover({ media, alt, className, placeholderLabel }: ListingMediaCoverProps) {
  const cover = media[0]

  if (!cover) {
    return (
      <div className={cn('overflow-hidden', className)}>
        <ListingMediaPlaceholder compact label={placeholderLabel} />
      </div>
    )
  }

  const coverUrl = resolveMediaUrl(cover.url)

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {cover.type === 'video' ? (
        <ListingMediaVideo
          src={coverUrl}
          compact
          muted
          preload="metadata"
          showPlayOverlay
          placeholderLabel={placeholderLabel}
        />
      ) : (
        <ListingMediaImage
          src={coverUrl}
          alt={alt}
          compact
          placeholderLabel={placeholderLabel}
        />
      )}

      {media.length > 1 && (
        <div className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
          +{media.length - 1}
        </div>
      )}
    </div>
  )
}
