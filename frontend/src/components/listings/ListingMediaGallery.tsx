import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { ListingMediaItem } from '@/utils/media'
import { resolveMediaUrl } from '@/utils/media'
import { ListingMediaImage } from '@/components/listings/ListingMediaImage'
import { ListingMediaVideo } from '@/components/listings/ListingMediaVideo'
import { ListingMediaPlaceholder } from '@/components/listings/ListingMediaPlaceholder'
import { cn } from '@/lib/utils'

interface ListingMediaGalleryProps {
  media: ListingMediaItem[]
  alt: string
  className?: string
  frameClassName?: string
  placeholderLabel?: string
  compact?: boolean
  initialIndex?: number
  onActiveIndexChange?: (index: number) => void
  onExpand?: (activeIndex: number) => void
  expandLabel?: string
}

export function ListingMediaGallery({
  media,
  alt,
  className,
  frameClassName,
  placeholderLabel,
  compact = false,
  initialIndex = 0,
  onActiveIndexChange,
  onExpand,
  expandLabel,
}: ListingMediaGalleryProps) {
  const items = useMemo(() => media.filter((item) => item.url), [media])
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    setActiveIndex(Math.min(initialIndex, Math.max(items.length - 1, 0)))
  }, [initialIndex, items.length])

  useEffect(() => {
    onActiveIndexChange?.(activeIndex)
  }, [activeIndex, onActiveIndexChange])

  const selectIndex = (index: number) => setActiveIndex(index)

  if (items.length === 0) {
    return (
      <div className={cn('overflow-hidden rounded-xl border border-border/70', frameClassName, className)}>
        <ListingMediaPlaceholder
          label={placeholderLabel}
          compact={compact}
          className={compact ? 'min-h-[5.5rem]' : 'min-h-[12rem] sm:min-h-[16rem]'}
        />
      </div>
    )
  }

  const active = items[Math.min(activeIndex, items.length - 1)]
  const activeUrl = resolveMediaUrl(active.url)

  const goPrev = () => selectIndex((activeIndex - 1 + items.length) % items.length)
  const goNext = () => selectIndex((activeIndex + 1) % items.length)

  const mainViewport = (
    <>
      {active.type === 'video' ? (
        <ListingMediaVideo
          key={active.id}
          src={activeUrl}
          controls={!onExpand}
          preload="metadata"
          placeholderLabel={placeholderLabel}
          className="bg-black object-contain"
        />
      ) : (
        <ListingMediaImage
          key={active.id}
          src={activeUrl}
          alt={alt}
          placeholderLabel={placeholderLabel}
          compact={compact}
        />
      )}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Previous media"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Next media"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white">
            {activeIndex + 1}/{items.length}
          </div>
        </>
      )}

      {onExpand && items.length > 0 && expandLabel && (
        <div className="absolute bottom-2 left-2 z-10 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white">
          {expandLabel}
        </div>
      )}
    </>
  )

  return (
    <div className={cn('space-y-2', className)}>
      {onExpand ? (
        <button
          type="button"
          onClick={() => onExpand(activeIndex)}
          className={cn(
            'group relative block w-full overflow-hidden rounded-xl border border-border/70 bg-muted/20 text-left transition hover:border-primary/35 hover:ring-2 hover:ring-primary/10',
            compact ? 'aspect-[2/1] max-h-52' : 'aspect-video',
            frameClassName
          )}
        >
          {mainViewport}
        </button>
      ) : (
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-border/70 bg-muted/20',
            compact ? 'aspect-[4/3]' : 'aspect-video',
            frameClassName
          )}
        >
          {mainViewport}
        </div>
      )}

      {items.length > 1 && (
        <div className={cn('flex gap-2 overflow-x-auto pb-1', compact && 'gap-1.5')}>
          {items.map((item, index) => {
            const thumbUrl = resolveMediaUrl(item.url)
            const isActive = index === activeIndex
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectIndex(index)}
                className={cn(
                  'relative shrink-0 overflow-hidden rounded-lg border transition',
                  compact ? 'h-14 w-14' : 'h-16 w-16',
                  isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border/70 opacity-80 hover:opacity-100'
                )}
              >
                {item.type === 'video' ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <ListingMediaImage
                    key={item.id}
                    src={thumbUrl}
                    alt=""
                    compact
                    placeholderLabel={placeholderLabel}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
