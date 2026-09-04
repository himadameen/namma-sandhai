import type { ListingMediaItem } from '@/utils/media'
import { resolveMediaUrl } from '@/utils/media'
import { ListingMediaImage } from '@/components/listings/ListingMediaImage'
import { ListingMediaVideo } from '@/components/listings/ListingMediaVideo'
import { ListingMediaPlaceholder } from '@/components/listings/ListingMediaPlaceholder'
import { cn } from '@/lib/utils'

interface ListingMediaStripProps {
  media: ListingMediaItem[]
  alt: string
  placeholderLabel?: string
  className?: string
  itemClassName?: string
  onItemClick?: (index: number) => void
}

export function ListingMediaStrip({
  media,
  alt,
  placeholderLabel,
  className,
  itemClassName,
  onItemClick,
}: ListingMediaStripProps) {
  if (media.length === 0) {
    return (
      <div className={cn('overflow-hidden rounded-lg border border-border/70', itemClassName ?? 'h-16 w-16')}>
        <ListingMediaPlaceholder compact label={placeholderLabel} className="h-full w-full" />
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-0.5', className)}>
      {media.map((item, index) => {
        const mediaUrl = resolveMediaUrl(item.url)
        const Wrapper = onItemClick ? 'button' : 'div'

        return (
          <Wrapper
            key={item.id}
            type={onItemClick ? 'button' : undefined}
            onClick={onItemClick ? () => onItemClick(index) : undefined}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/20',
              onItemClick && 'transition hover:border-primary/40 hover:ring-2 hover:ring-primary/15',
              itemClassName ?? 'h-16 w-16'
            )}
          >
            {item.type === 'video' ? (
              <ListingMediaVideo
                src={mediaUrl}
                compact
                muted
                preload="metadata"
                showPlayOverlay
                placeholderLabel={placeholderLabel}
              />
            ) : (
              <ListingMediaImage
                src={mediaUrl}
                alt={item.name ?? alt}
                compact
                placeholderLabel={placeholderLabel}
              />
            )}
          </Wrapper>
        )
      })}
    </div>
  )
}
