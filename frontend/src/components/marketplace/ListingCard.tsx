import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { Listing } from '@/api/listings'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-card-hover">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.imageUrl ?? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80'}
          alt={cropName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-tamil text-lg font-bold">
              {getCropEmoji(listing.crop.name)} {cropName}
            </p>
            {listing.variety && (
              <p className="text-sm text-muted-foreground">{listing.variety}</p>
            )}
          </div>
          <Badge variant={listing.status === 'ACTIVE' ? 'success' : 'muted'}>
            {t(`listings.status.${listing.status}`)}
          </Badge>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {listing.quantity.toLocaleString()} {listing.unit} {t('listings.available')}
        </p>

        <p className="mt-1 text-xl font-bold text-secondary">
          {formatCurrency(listing.expectedPrice)}/{listing.unit}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          {listing.district}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="truncate font-tamil text-sm font-medium">👨‍🌾 {listing.farmer.name}</p>
            {listing.farmer.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <CheckCircle2 className="h-3 w-3" />
                {t('listings.verifiedFarmer')}
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/marketplace/${listing.id}`}>
              {t('common.viewProduce')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
