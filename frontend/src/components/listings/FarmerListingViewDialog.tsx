import { useEffect } from 'react'
import { X, MapPin, Calendar } from 'lucide-react'
import type { Listing } from '@/api/listings'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/utils/listings'
import { listingMediaItems } from '@/utils/media'
import { ListingMediaGallery } from '@/components/listings/ListingMediaGallery'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FarmerListingViewDialogProps {
  listing: Listing
  cropName: string
  locale: string
  textClass?: string
  placeholderLabel: string
  labels: {
    quantity: string
    price: string
    totalValue: string
    district: string
    listedOn: string
    harvestDate: string
    availability: string
    description: string
    close: string
    status: (status: Listing['status']) => string
  }
  initialMediaIndex?: number
  onClose: () => void
}

function statusBadgeVariant(status: Listing['status']) {
  if (status === 'ACTIVE') return 'success' as const
  if (status === 'SOLD') return 'accent' as const
  return 'muted' as const
}

export function FarmerListingViewDialog({
  listing,
  cropName,
  locale,
  textClass,
  placeholderLabel,
  labels,
  initialMediaIndex = 0,
  onClose,
}: FarmerListingViewDialogProps) {
  const media = listingMediaItems(listing)
  const estValue = listing.quantity * listing.expectedPrice

  useBodyScrollLock(true)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex h-full items-start justify-center overflow-y-auto px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <Card
          className="my-2 flex w-full max-w-2xl flex-col overflow-hidden sm:my-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={cn('text-lg font-bold leading-snug text-foreground sm:text-xl', textClass)}>
                  {cropName}
                </h2>
                <Badge variant={statusBadgeVariant(listing.status)}>{labels.status(listing.status)}</Badge>
              </div>
              {listing.variety && (
                <p className={cn('text-sm text-muted-foreground', textClass)}>{listing.variety}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={labels.close}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <CardContent className="max-h-[calc(100vh-8rem)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <ListingMediaGallery
              key={`${listing.id}-${initialMediaIndex}`}
              media={media}
              alt={cropName}
              placeholderLabel={placeholderLabel}
              initialIndex={initialMediaIndex}
            />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{labels.quantity}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-foreground">
                  {listing.quantity.toLocaleString(locale)} {listing.unit}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{labels.price}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-secondary">
                  {formatCurrency(listing.expectedPrice)}/{listing.unit}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{labels.totalValue}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-primary">{formatCurrency(estValue)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{labels.district}</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  {listing.district}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {labels.listedOn}: {formatDate(listing.createdAt, locale)}
              </span>
              {listing.harvestDate && (
                <span>
                  {labels.harvestDate}: {formatDate(listing.harvestDate, locale)}
                </span>
              )}
              {listing.availableFrom && listing.availableUntil && (
                <span>
                  {labels.availability}: {formatDate(listing.availableFrom, locale)} –{' '}
                  {formatDate(listing.availableUntil, locale)}
                </span>
              )}
            </div>

            {listing.description && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">{labels.description}</p>
                <p className={cn('text-sm leading-relaxed text-foreground', textClass)}>{listing.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
