import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { ListingMediaPlaceholder } from '@/components/listings/ListingMediaPlaceholder'
import { cn } from '@/lib/utils'

interface ListingMediaVideoProps {
  src: string
  className?: string
  placeholderLabel?: string
  compact?: boolean
  controls?: boolean
  muted?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  showPlayOverlay?: boolean
}

export function ListingMediaVideo({
  src,
  className,
  placeholderLabel,
  compact = false,
  controls = false,
  muted = false,
  preload = 'metadata',
  showPlayOverlay = false,
}: ListingMediaVideoProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (failed || !src) {
    return (
      <ListingMediaPlaceholder
        compact={compact}
        label={placeholderLabel}
        className={cn('h-full w-full', className)}
      />
    )
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      <video
        src={src}
        className={cn('h-full w-full', controls ? 'object-contain' : 'object-cover')}
        controls={controls}
        muted={muted}
        preload={preload}
        onError={() => setFailed(true)}
      />
      {showPlayOverlay && !controls && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
            <Play className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  )
}
