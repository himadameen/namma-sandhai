import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, X, MapPin, User, Package, IndianRupee, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { purchaseRequestsApi } from '@/api/purchaseRequests'
import type { ListingDetail } from '@/api/listings'
import { useLocaleText } from '@/hooks/useLocaleText'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormDropdownSelect } from '@/components/ui/form-dropdown-select'
import { cn } from '@/lib/utils'

const schema = z.object({
  quantity: z.coerce.number().positive(),
  offeredPrice: z.coerce.number().positive(),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface PurchaseRequestDialogProps {
  listing: ListingDetail
  onClose: () => void
  onSuccess: () => void
}

export function PurchaseRequestDialog({ listing, onClose, onSuccess }: PurchaseRequestDialogProps) {
  const { t, isTamil, textClass } = useLocaleText()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  useBodyScrollLock(true)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: Math.min(200, listing.quantity),
      offeredPrice: listing.expectedPrice,
      deliveryType: 'DELIVERY',
      message: '',
    },
  })

  const quantity = watch('quantity')
  const offeredPrice = watch('offeredPrice')

  const mutation = useMutation({
    mutationFn: purchaseRequestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-requests'] })
      onSuccess()
      onClose()
    },
    onError: (err) => setError(err instanceof Error ? err.message : t('common.error')),
  })

  const onSubmit = (values: FormValues) => {
    setError('')
    mutation.mutate({ listingId: listing.id, ...values })
  }

  const deliveryTypeOptions = useMemo(
    () => [
      { value: 'DELIVERY' as const, label: t('requests.delivery') },
      { value: 'PICKUP' as const, label: t('requests.pickup') },
    ],
    [t]
  )

  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name
  const estimatedTotal = (Number(quantity) || 0) * (Number(offeredPrice) || 0)
  const priceDiff = (Number(offeredPrice) || 0) - listing.expectedPrice

  const priceHint = useMemo(() => {
    if (!offeredPrice || priceDiff === 0) {
      return { label: t('requests.priceMatchesListing'), tone: 'neutral' as const, icon: Minus }
    }
    if (priceDiff > 0) {
      return {
        label: t('requests.priceAboveListing', { amount: formatCurrency(priceDiff) }),
        tone: 'above' as const,
        icon: TrendingUp,
      }
    }
    return {
      label: t('requests.priceBelowListing', { amount: formatCurrency(Math.abs(priceDiff)) }),
      tone: 'below' as const,
      icon: TrendingDown,
    }
  }, [offeredPrice, priceDiff, t])

  const PriceIcon = priceHint.icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-request-title"
      >
        <div className="border-b border-border/50 bg-gradient-to-br from-primary/[0.08] to-transparent px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('common.sendPurchaseRequest')}
              </p>
              <h2 id="purchase-request-title" className={cn('mt-1 flex items-center gap-2 text-xl font-bold', textClass)}>
                <span>{getCropEmoji(listing.crop.name)}</span>
                {cropName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {listing.farmer.name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.district}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('listings.closeView')}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5">
              <p className="text-[11px] font-medium text-muted-foreground">{t('requests.listingPriceLabel')}</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {formatCurrency(listing.expectedPrice)}/{listing.unit}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5">
              <p className="text-[11px] font-medium text-muted-foreground">{t('listings.quantity')}</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {listing.quantity} {listing.unit}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                {t('requests.quantity')}
              </label>
              <Input
                type="number"
                min="1"
                max={listing.quantity}
                step="1"
                className="h-11"
                {...register('quantity')}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('requests.maxAvailable', { qty: listing.quantity, unit: listing.unit })}
              </p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                {t('requests.offeredPrice')}
              </label>
              <Input type="number" min="1" step="0.5" className="h-11" {...register('offeredPrice')} />
              <p
                className={cn(
                  'mt-1 flex items-center gap-1 text-xs font-medium',
                  priceHint.tone === 'above' && 'text-secondary',
                  priceHint.tone === 'below' && 'text-accent-foreground',
                  priceHint.tone === 'neutral' && 'text-muted-foreground'
                )}
              >
                <PriceIcon className="h-3 w-3" />
                {priceHint.label}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">{t('requests.estimatedTotal')}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(estimatedTotal)}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('requests.deliveryType')}</label>
            <FormDropdownSelect
              name="deliveryType"
              control={control}
              options={deliveryTypeOptions}
              ariaLabel={t('requests.deliveryType')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('requests.message')}</label>
            <Textarea rows={3} placeholder={t('requests.message')} {...register('message')} />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="sm:min-w-28">
              {t('listings.cancel')}
            </Button>
            <Button type="submit" className={cn('font-tamil sm:min-w-36', textClass)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('requests.submitRequest')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
