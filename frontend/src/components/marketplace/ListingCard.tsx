import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ArrowRight, CheckCircle2, Package, User } from 'lucide-react'
import type { Listing } from '@/api/listings'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { listingMediaItems } from '@/utils/media'
import { ListingMediaCover } from '@/components/listings/ListingMediaCover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ListingCardProps {
  listing: Listing
  basePath?: string
  className?: string
}

export function ListingCard({ listing, basePath = '/marketplace', className }: ListingCardProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name
  const media = listingMediaItems(listing)

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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={listing.status === 'ACTIVE' ? 'success' : 'muted'} className="shadow-sm">
            {t(`listings.status.${listing.status}`)}
          </Badge>
          {listing.farmer.isVerified && (
            <Badge variant="default" className="gap-1 bg-white/90 text-foreground shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3 text-secondary" />
              {t('listings.verifiedFarmer')}
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-tamil text-lg font-bold leading-snug text-white drop-shadow-sm">
              {getCropEmoji(listing.crop.name)} {cropName}
            </p>
            {listing.variety && (
              <p className="truncate text-xs text-white/85">{listing.variety}</p>
            )}
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

      <div className="flex flex-1 flex-col p-4 sm:p-5">
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

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 truncate text-sm font-semibold">
              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-tamil truncate">{listing.farmer.name}</span>
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{listing.farmer.district}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
            {t('common.viewProduce')}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
