import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import type { Order, OrderStatusUpdate } from '@/api/orders'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'accent' | 'muted'> = {
  PENDING_CONFIRMATION: 'accent',
  CONFIRMED: 'default',
  IN_TRANSIT: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

interface OrderCardProps {
  order: Order
  role: 'FARMER' | 'BUYER'
  isUpdating?: boolean
  onUpdateStatus: (orderId: string, status: OrderStatusUpdate) => void
}

function getActions(
  order: Order,
  role: 'FARMER' | 'BUYER'
): { status: OrderStatusUpdate; labelKey: string; variant?: 'default' | 'destructive' | 'outline' }[] {
  if (order.status === 'PENDING_CONFIRMATION') {
    if (role === 'FARMER') {
      return [
        { status: 'CONFIRMED', labelKey: 'orders.confirmOrder' },
        { status: 'CANCELLED', labelKey: 'orders.cancelOrder', variant: 'destructive' },
      ]
    }
    return [{ status: 'CANCELLED', labelKey: 'orders.cancelOrder', variant: 'destructive' }]
  }
  if (order.status === 'CONFIRMED' && role === 'FARMER') {
    return [
      { status: 'IN_TRANSIT', labelKey: 'orders.markInTransit' },
      { status: 'CANCELLED', labelKey: 'orders.cancelOrder', variant: 'destructive' },
    ]
  }
  if (order.status === 'IN_TRANSIT') {
    return [{ status: 'COMPLETED', labelKey: 'orders.markCompleted' }]
  }
  return []
}

export function OrderCard({ order, role, isUpdating, onUpdateStatus }: OrderCardProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const cropName = isTamil ? order.listing.crop.nameTamil : order.listing.crop.name
  const actions = getActions(order, role)
  const counterparty =
    role === 'FARMER'
      ? order.buyer.organization ?? order.buyer.name
      : order.farmer.name

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{getCropEmoji(order.listing.crop.name)}</span>
            <div>
              <h3 className="font-semibold text-foreground">{cropName}</h3>
              <p className="text-sm text-muted-foreground">
                {role === 'FARMER' ? t('orders.fromBuyer') : t('orders.fromFarmer')}: {counterparty}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.listing.district} · {order.deliveryType === 'DELIVERY' ? t('requests.delivery') : t('requests.pickup')}
              </p>
            </div>
          </div>
          <Badge variant={statusVariant[order.status] ?? 'muted'}>
            {t(`orders.status.${order.status}`)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">{t('requests.quantity')}</p>
            <p className="font-semibold">
              {order.quantity} {order.listing.unit}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('requests.offeredPrice')}</p>
            <p className="font-semibold">{formatCurrency(order.agreedPrice)}/{order.listing.unit}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('orders.total')}</p>
            <p className="font-semibold text-primary">{formatCurrency(order.totalAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('orders.placed')}</p>
            <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <OrderTimeline timeline={order.timeline} cancelled={order.status === 'CANCELLED'} />

        {order.status === 'COMPLETED' && order.salesRecord && (
          <p className="text-sm text-success">
            {t('orders.salesRecorded')} — {new Date(order.salesRecord.soldAt).toLocaleDateString('en-IN')}
          </p>
        )}

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {actions.map((action) => (
              <Button
                key={action.status}
                size="sm"
                variant={action.variant ?? 'default'}
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, action.status)}
              >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t(action.labelKey)}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
