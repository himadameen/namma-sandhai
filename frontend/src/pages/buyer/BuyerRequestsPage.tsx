import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { purchaseRequestsApi } from '@/api/purchaseRequests'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'accent' | 'muted'> = {
  PENDING: 'accent',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  COUNTERED: 'default',
}

export function BuyerRequestsPage() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')

  const { data: requests, isLoading } = useQuery({
    queryKey: ['buyer-requests'],
    queryFn: purchaseRequestsApi.getBuyerRequests,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">{t('nav.purchaseRequests')}</h1>
          <p className="mt-1 text-muted-foreground">{t('requests.buyerSubtitle')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/marketplace">{t('common.searchProduce')}</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : requests?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('requests.noOutgoing')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests?.map((request) => {
            const cropName = isTamil ? request.listing.crop.nameTamil : request.listing.crop.name
            return (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-tamil text-lg font-bold">
                        {getCropEmoji(request.listing.crop.name)} {cropName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('listings.verifiedFarmer')}: {request.listing.farmer.name} ·{' '}
                        {request.listing.district}
                      </p>
                    </div>
                    <Badge variant={statusVariant[request.status] ?? 'muted'}>
                      {t(`requests.status.${request.status}`)}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <p>
                      {request.quantity} {request.listing.unit}
                    </p>
                    <p>
                      {formatCurrency(request.offeredPrice)}/{request.listing.unit}
                    </p>
                    <p>{request.deliveryType}</p>
                  </div>
                  {request.order && (
                    <p className="mt-3 text-sm text-success">
                      {t('requests.orderCreated')} —{' '}
                      <Link to="/buyer/orders" className="underline">
                        {t('nav.orders')}
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
