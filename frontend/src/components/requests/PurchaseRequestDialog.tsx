import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { purchaseRequestsApi } from '@/api/purchaseRequests'
import type { ListingDetail } from '@/api/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormDropdownSelect } from '@/components/ui/form-dropdown-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    control,
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-tamil text-lg">{t('common.sendPurchaseRequest')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('requests.quantity')}</label>
              <Input
                type="number"
                min="1"
                max={listing.quantity}
                step="1"
                {...register('quantity')}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('requests.maxAvailable', { qty: listing.quantity, unit: listing.unit })}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('requests.offeredPrice')}</label>
              <Input type="number" min="1" step="0.5" {...register('offeredPrice')} />
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
              <Textarea rows={3} {...register('message')} />
            </div>
            {error && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full font-tamil" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('requests.submitRequest')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
