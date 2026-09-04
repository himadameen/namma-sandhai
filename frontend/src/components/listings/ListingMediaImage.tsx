import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { ListingMediaPlaceholder } from '@/components/listings/ListingMediaPlaceholder'
import { cn } from '@/lib/utils'

interface ListingMediaImageProps {
  src: string
  alt: string
  className?: string
  placeholderLabel?: string
  compact?: boolean
}

export function ListingMediaImage({
  src,
  alt,
  className,
  placeholderLabel,
  compact = false,
}: ListingMediaImageProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      fallback={
        <ListingMediaPlaceholder
          compact={compact}
          label={placeholderLabel}
          className="h-full w-full"
        />
      }
    />
  )
}
