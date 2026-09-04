import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CheckCircle2, MapPin, Calendar } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const isTamil = i18n.language?.startsWith('ta')
  const locale = isTamil ? 'ta-IN' : 'en-IN'
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <p className="text-destructive">{t('common.error')}</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/marketplace">{t('listings.backToMarketplace')}</Link>
        </Button>
      </div>
    )
  }

  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name
  const isBuyer = isAuthenticated && user?.role === 'BUYER'
  const media = listingMediaItems(listing)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/marketplace">
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
            <Card>
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
              <Card>
                <CardContent className="pt-5">
                  <p className="text-sm text-muted-foreground">{t('listings.marketAverage')}</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(listing.marketAverage.averagePrice)}/{listing.marketAverage.unit}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.district}, {listing.state}
            </div>
            {listing.harvestDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t('listings.harvestDate')}: {formatDate(listing.harvestDate, locale)}
              </div>
            )}
            {(listing.availableFrom || listing.availableUntil) && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <Calendar className="h-4 w-4" />
                {t('listings.availability')}: {formatDate(listing.availableFrom, locale)} —{' '}
                {formatDate(listing.availableUntil, locale)}
              </div>
            )}
          </div>

          {listing.description && (
            <p className="mt-6 leading-relaxed text-muted-foreground">{listing.description}</p>
          )}

          <Card className="mt-8">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div>
                <p className="font-tamil font-semibold">👨‍🌾 {listing.farmer.name}</p>
                <p className="text-sm text-muted-foreground">{listing.farmer.district}</p>
                {listing.farmer.isVerified && (
                  <span className="mt-1 inline-flex items-center gap-1 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('listings.verifiedFarmer')}
                  </span>
                )}
              </div>

              {isBuyer ? (
                <>
                  {requestSent && (
                    <p className="mb-2 text-sm text-success">{t('requests.sentSuccess')}</p>
                  )}
                  <Button
                    size="lg"
                    className="font-tamil"
                    onClick={() => setShowRequestForm(true)}
                  >
                    {t('common.sendPurchaseRequest')}
                  </Button>
                </>
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
