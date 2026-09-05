import { Link } from 'react-router-dom'
import { MapPin, ArrowRight, CheckCircle2, Package, User } from 'lucide-react'
import type { Listing } from '@/api/listings'
import { formatCurrency, cn } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { listingMediaItems } from '@/utils/media'
import { ListingMediaCover } from '@/components/listings/ListingMediaCover'
import { Badge } from '@/components/ui/badge'
import { PriceMoveChip } from '@/components/marketplace/PriceMoveChip'
import { useLocaleText } from '@/hooks/useLocaleText'

interface ListingCardProps {
  listing: Listing
  basePath?: string
  variant?: 'grid' | 'list'
  className?: string
}

export function ListingCard({ listing, basePath = '/marketplace', variant = 'grid', className }: ListingCardProps) {
  const { t, isTamil, textClass } = useLocaleText()
  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name
  const media = listingMediaItems(listing)

  if (variant === 'list') {
    return (
      <Link
        to={`${basePath}/${listing.id}`}
        className={cn(
          'group grid overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover sm:grid-cols-[11rem_1fr]',
          className
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted sm:aspect-auto sm:min-h-[8.5rem]">
          <ListingMediaCover
            media={media}
            alt={cropName}
            placeholderLabel={t('listings.mediaPlaceholder')}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-3 p-4 sm:px-5 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={cn('truncate text-lg font-bold text-foreground', textClass)}>
                  {getCropEmoji(listing.crop.name)} {cropName}
                </h3>
                {listing.farmer.isVerified && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('listings.verifiedFarmer')}
                  </Badge>
                )}
              </div>
              {listing.variety && <p className="mt-0.5 truncate text-sm text-muted-foreground">{listing.variety}</p>}
              {listing.priceMove && <PriceMoveChip move={listing.priceMove} className="mt-2" />}
            </div>
            <p className="shrink-0 text-right">
              <span className="block text-lg font-bold text-secondary">{formatCurrency(listing.expectedPrice)}</span>
              <span className="text-xs text-muted-foreground">/{listing.unit}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Package className="h-3.5 w-3.5 text-primary" />
                {listing.quantity.toLocaleString()} {listing.unit}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {listing.district}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span className="font-tamil">{listing.farmer.name}</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              {t('common.viewProduce')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`${basePath}/${listing.id}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <ListingMediaCover
          media={media}
          alt={cropName}
          placeholderLabel={t('listings.mediaPlaceholder')}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={listing.status === 'ACTIVE' ? 'success' : 'muted'} className="shadow-sm">
            {t(`listings.status.${listing.status}`)}
          </Badge>
          {listing.farmer.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3 text-secondary" />
              {t('listings.verifiedFarmer')}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className={cn('font-tamil text-lg font-bold leading-snug text-white drop-shadow-sm', textClass)}>
              {getCropEmoji(listing.crop.name)} {cropName}
            </p>
            {listing.variety && <p className="truncate text-xs text-white/85">{listing.variety}</p>}
          </div>
          <div className="shrink-0 rounded-xl bg-white/95 px-2.5 py-1.5 text-right shadow-sm backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t('listings.price')}</p>
            <p className="text-sm font-bold text-secondary">
              {formatCurrency(listing.expectedPrice)}
              <span className="text-xs font-medium text-muted-foreground">/{listing.unit}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Package className="h-3.5 w-3.5 text-primary" />
            {listing.quantity.toLocaleString()} {listing.unit}
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {listing.district}
          </span>
        </div>
        {listing.priceMove && <PriceMoveChip move={listing.priceMove} className="mt-3 w-fit" />}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 truncate text-sm font-semibold">
              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-tamil truncate">{listing.farmer.name}</span>
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
            {t('listings.requestNow')}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
