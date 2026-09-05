import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CheckCircle2, MapPin, Calendar, User, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { listingsApi } from '@/api/listings'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji, formatDate } from '@/utils/listings'
import { listingMediaItems } from '@/utils/media'
import { ListingMediaGallery } from '@/components/listings/ListingMediaGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PurchaseRequestDialog } from '@/components/requests/PurchaseRequestDialog'
import { PriceMoveChip } from '@/components/marketplace/PriceMoveChip'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const isTamil = i18n.language?.startsWith('ta')
  const locale = isTamil ? 'ta-IN' : 'en-IN'
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const isBuyerShell = location.pathname.startsWith('/buyer/marketplace')
  const marketplaceBase = isBuyerShell ? '/buyer/marketplace' : '/marketplace'

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
    enabled: !!id,
  })

  if (isAuthenticated && user?.role === 'BUYER' && !isBuyerShell && id) {
    return <Navigate to={`/buyer/marketplace/${id}`} replace />
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', !isBuyerShell && 'mx-auto max-w-4xl')}>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className={cn('py-16 text-center', !isBuyerShell && 'mx-auto max-w-4xl')}>
        <p className="text-destructive">{t('common.error')}</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to={marketplaceBase}>{t('listings.backToMarketplace')}</Link>
        </Button>
      </div>
    )
  }

  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name
  const isBuyer = isAuthenticated && user?.role === 'BUYER'
  const media = listingMediaItems(listing)
  const priceDiff = listing.marketAverage
    ? listing.expectedPrice - listing.marketAverage.averagePrice
    : null

  return (
    <div className={cn('space-y-6 pb-8', !isBuyerShell && 'mx-auto max-w-4xl pb-12')}>
      <Button variant="ghost" size="sm" asChild>
        <Link to={marketplaceBase}>
          <ArrowLeft className="h-4 w-4" />
          {t('listings.backToMarketplace')}
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <ListingMediaGallery
          media={media}
          alt={cropName}
          placeholderLabel={t('listings.mediaPlaceholder')}
          frameClassName="rounded-none border-0 sm:aspect-[2/1]"
          className="px-6 pt-6 sm:px-8 sm:pt-8"
        />

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-tamil text-3xl font-bold text-primary">
                {getCropEmoji(listing.crop.name)} {cropName}
              </h1>
              {listing.variety && (
                <p className="mt-1 text-lg text-muted-foreground">{listing.variety}</p>
              )}
            </div>
            <Badge variant={listing.status === 'ACTIVE' ? 'success' : 'muted'}>
              {t(`listings.status.${listing.status}`)}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-border/80">
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">{t('listings.quantity')}</p>
                <p className="text-xl font-bold">
                  {listing.quantity.toLocaleString()} {listing.unit}
                </p>
              </CardContent>
            </Card>
            <Card className="border-secondary/30 bg-secondary/5">
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">{t('listings.price')}</p>
                <p className="text-xl font-bold text-secondary">
                  {formatCurrency(listing.expectedPrice)}/{listing.unit}
                </p>
              </CardContent>
            </Card>
            {listing.marketAverage && (
              <Card className="border-border/80">
                <CardContent className="pt-5">
                  <p className="text-sm text-muted-foreground">{t('listings.marketAverage')}</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(listing.marketAverage.averagePrice)}/{listing.marketAverage.unit}
                  </p>
                  {priceDiff !== null && priceDiff !== 0 && (
                    <p
                      className={cn(
                        'mt-1 flex items-center gap-1 text-xs font-medium',
                        priceDiff > 0 ? 'text-secondary' : 'text-accent-foreground'
                      )}
                    >
                      {priceDiff > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {priceDiff > 0
                        ? t('requests.priceAboveListing', { amount: formatCurrency(priceDiff) })
                        : t('requests.priceBelowListing', { amount: formatCurrency(Math.abs(priceDiff)) })}
                    </p>
                  )}
                  {priceDiff === 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Minus className="h-3 w-3" />
                      {t('requests.priceMatchesListing')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {listing.priceMove && (
            <Card className="mt-4 border-border/80">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
                <div>
                  <p className="text-sm font-semibold">{t('market.tickerTitle')}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('market.yesterday')} {formatCurrency(listing.priceMove.yesterdayPrice)}/{listing.priceMove.unit}
                    <span className="mx-2">→</span>
                    {t('market.today')} {formatCurrency(listing.priceMove.todayPrice)}/{listing.priceMove.unit}
                  </p>
                </div>
                <PriceMoveChip move={listing.priceMove} />
              </CardContent>
            </Card>
          )}

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {listing.district}, {listing.state}
            </div>
            {listing.harvestDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                {t('listings.harvestDate')}: {formatDate(listing.harvestDate, locale)}
              </div>
            )}
            {(listing.availableFrom || listing.availableUntil) && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <Calendar className="h-4 w-4 shrink-0" />
                {t('listings.availability')}: {formatDate(listing.availableFrom, locale)} —{' '}
                {formatDate(listing.availableUntil, locale)}
              </div>
            )}
          </div>

          {listing.description && (
            <p className="mt-6 leading-relaxed text-muted-foreground">{listing.description}</p>
          )}

          <Card className="mt-8 border-primary/15 bg-gradient-to-br from-primary/[0.04] to-transparent">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div>
                <p className="inline-flex items-center gap-2 font-tamil font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  {listing.farmer.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{listing.farmer.district}</p>
                {listing.farmer.isVerified && (
                  <span className="mt-1 inline-flex items-center gap-1 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('listings.verifiedFarmer')}
                  </span>
                )}
              </div>

              {isBuyer ? (
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  {requestSent && (
                    <p className="text-sm text-success">{t('requests.sentSuccess')}</p>
                  )}
                  <Button size="lg" className="font-tamil" onClick={() => setShowRequestForm(true)}>
                    {t('common.sendPurchaseRequest')}
                  </Button>
                </div>
              ) : !isAuthenticated ? (
                <Button size="lg" className="font-tamil" asChild>
                  <Link to="/login">{t('common.sendPurchaseRequest')}</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {showRequestForm && listing && (
        <PurchaseRequestDialog
          listing={listing}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            setRequestSent(true)
            navigate('/buyer/requests')
          }}
        />
      )}
    </div>
  )
}
