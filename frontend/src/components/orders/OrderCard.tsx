import { Loader2, Building2, MapPin, Truck, CalendarDays, IndianRupee, Package } from 'lucide-react'
import { type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/lib/utils'
import { formatDate, getCropEmoji } from '@/utils/listings'
import type { Order, OrderStatusUpdate } from '@/api/orders'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  className?: string
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

export function OrderCard({ order, role, isUpdating, onUpdateStatus, className }: OrderCardProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const locale = isTamil ? 'ta-IN' : 'en-IN'
  const cropName = isTamil ? order.listing.crop.nameTamil : order.listing.crop.name
  const actions = getActions(order, role)
  const counterparty =
    role === 'FARMER'
      ? order.buyer.organization ?? order.buyer.name
      : order.farmer.name
  const isActive = order.status !== 'COMPLETED' && order.status !== 'CANCELLED'

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-card-hover',
        isActive ? 'border-primary/30 shadow-sm' : 'border-border/80',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 bg-muted/15 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="text-2xl">{getCropEmoji(order.listing.crop.name)}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-tamil text-lg font-bold">{cropName}</h3>
              <Badge variant={statusVariant[order.status] ?? 'muted'}>
                {t(`orders.status.${order.status}`)}
              </Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                {role === 'FARMER' ? t('orders.fromBuyer') : t('orders.fromFarmer')}: {counterparty}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {order.listing.district}
              </span>
              <span className="inline-flex items-center gap-1">
                {order.deliveryType === 'DELIVERY' ? (
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                )}
                {order.deliveryType === 'DELIVERY' ? t('requests.delivery') : t('requests.pickup')}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t('orders.total')}</p>
          <p className="text-xl font-bold text-primary tabular-nums">{formatCurrency(order.totalAmount)}</p>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
        <StatItem
          icon={Package}
          label={t('requests.quantity')}
          value={`${order.quantity} ${order.listing.unit}`}
        />
        <StatItem
          icon={IndianRupee}
          label={t('requests.offeredPrice')}
          value={`${formatCurrency(order.agreedPrice)}/${order.listing.unit}`}
          highlight
        />
        <StatItem
          icon={CalendarDays}
          label={t('orders.placed')}
          value={formatDate(order.createdAt, locale)}
        />
        <StatItem
          icon={CalendarDays}
          label={t('orders.updated')}
          value={formatDate(order.updatedAt, locale)}
        />
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <OrderTimeline timeline={order.timeline} cancelled={order.status === 'CANCELLED'} />
      </div>

      {order.status === 'COMPLETED' && order.salesRecord && (
        <p className="mx-4 mb-4 text-sm text-success sm:mx-5">
          {t('orders.salesRecorded')} — {formatDate(order.salesRecord.soldAt, locale)}
        </p>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border/50 bg-muted/10 px-4 py-3.5 sm:px-5">
          {actions.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant={action.variant ?? 'default'}
              disabled={isUpdating}
              onClick={() => onUpdateStatus(order.id, action.status)}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t(action.labelKey)}
            </Button>
          ))}
        </div>
      )}
    </article>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3.5 py-3',
        highlight ? 'border-secondary/30 bg-secondary/5' : 'border-border/60 bg-muted/20'
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </div>
      <p className={cn('text-sm font-bold tabular-nums', highlight && 'text-secondary')}>{value}</p>
    </div>
  )
}
