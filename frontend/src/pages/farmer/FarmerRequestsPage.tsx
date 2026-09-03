import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Check, X, RefreshCw, Loader2 } from 'lucide-react'
import { purchaseRequestsApi, type PurchaseRequest } from '@/api/purchaseRequests'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'accent' | 'muted'> = {
  PENDING: 'accent',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  COUNTERED: 'default',
}

export function FarmerRequestsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const isTamil = i18n.language?.startsWith('ta')
  const [counteringId, setCounteringId] = useState<string | null>(null)
  const [counterPrice, setCounterPrice] = useState('')

  const { data: requests, isLoading } = useQuery({
    queryKey: ['farmer-requests'],
    queryFn: purchaseRequestsApi.getFarmerRequests,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['farmer-requests'] })

  const acceptMutation = useMutation({
    mutationFn: purchaseRequestsApi.accept,
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: purchaseRequestsApi.reject,
    onSuccess: invalidate,
  })

  const counterMutation = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) =>
      purchaseRequestsApi.counter(id, { offeredPrice: price }),
    onSuccess: () => {
      setCounteringId(null)
      setCounterPrice('')
      invalidate()
    },
  })

  const pending = requests?.filter((r) => r.status === 'PENDING' || r.status === 'COUNTERED') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">
          {t('nav.purchaseRequests')}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('requests.farmerSubtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : requests?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('requests.noIncoming')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <p className="text-sm font-medium text-accent">
              {t('requests.pendingCount', { count: pending.length })}
            </p>
          )}
          {requests?.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isTamil={isTamil}
              t={t}
              counteringId={counteringId}
              counterPrice={counterPrice}
              onCounterPriceChange={setCounterPrice}
              onStartCounter={(id, price) => {
                setCounteringId(id)
                setCounterPrice(String(price))
              }}
              onCancelCounter={() => setCounteringId(null)}
              onAccept={() => acceptMutation.mutate(request.id)}
              onReject={() => rejectMutation.mutate(request.id)}
              onSubmitCounter={() =>
                counterMutation.mutate({ id: request.id, price: Number(counterPrice) })
              }
              isActing={
                acceptMutation.isPending || rejectMutation.isPending || counterMutation.isPending
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({
  request,
  isTamil,
  t,
  counteringId,
  counterPrice,
  onCounterPriceChange,
  onStartCounter,
  onCancelCounter,
  onAccept,
  onReject,
  onSubmitCounter,
  isActing,
}: {
  request: PurchaseRequest
  isTamil: boolean
  t: (key: string, opts?: Record<string, unknown>) => string
  counteringId: string | null
  counterPrice: string
  onCounterPriceChange: (v: string) => void
  onStartCounter: (id: string, price: number) => void
  onCancelCounter: () => void
  onAccept: () => void
  onReject: () => void
  onSubmitCounter: () => void
  isActing: boolean
}) {
  const cropName = isTamil ? request.listing.crop.nameTamil : request.listing.crop.name
  const canRespond = request.status === 'PENDING' || request.status === 'COUNTERED'

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-tamil text-lg font-bold">
              {getCropEmoji(request.listing.crop.name)} {cropName}
            </p>
            <p className="text-sm text-muted-foreground">
              {request.buyer.organization ?? request.buyer.name} · {request.buyer.district}
            </p>
          </div>
          <Badge variant={statusVariant[request.status] ?? 'muted'}>
            {t(`requests.status.${request.status}`)}
          </Badge>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <p>
            <span className="text-muted-foreground">{t('requests.quantity')}:</span>{' '}
            <strong>
              {request.quantity} {request.listing.unit}
            </strong>
          </p>
          <p>
            <span className="text-muted-foreground">{t('requests.offeredPrice')}:</span>{' '}
            <strong>
              {formatCurrency(request.offeredPrice)}/{request.listing.unit}
            </strong>
          </p>
          <p>
            <span className="text-muted-foreground">{t('requests.deliveryType')}:</span>{' '}
            <strong>{request.deliveryType}</strong>
          </p>
        </div>

        {request.message && (
          <p className="mt-3 rounded-xl bg-muted p-3 text-sm">{request.message}</p>
        )}

        {request.order && (
          <p className="mt-3 text-sm text-success">
            {t('requests.orderCreated')}: {request.order.id.slice(-8).toUpperCase()}
          </p>
        )}

        {canRespond && !request.order && (
          <div className="mt-4 flex flex-wrap gap-2">
            {counteringId === request.id ? (
              <div className="flex w-full flex-wrap items-center gap-2">
                <Input
                  type="number"
                  className="w-32"
                  value={counterPrice}
                  onChange={(e) => onCounterPriceChange(e.target.value)}
                  placeholder={t('requests.counterPrice')}
                />
                <Button size="sm" onClick={onSubmitCounter} disabled={isActing}>
                  {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : t('requests.submitCounter')}
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelCounter}>
                  {t('listings.cancel')}
                </Button>
              </div>
            ) : (
              <>
                <Button size="sm" onClick={onAccept} disabled={isActing}>
                  <Check className="h-4 w-4" />
                  {t('common.accept')}
                </Button>
                <Button size="sm" variant="destructive" onClick={onReject} disabled={isActing}>
                  <X className="h-4 w-4" />
                  {t('common.reject')}
                </Button>
                {request.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartCounter(request.id, request.offeredPrice)}
                    disabled={isActing}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t('common.counterOffer')}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
