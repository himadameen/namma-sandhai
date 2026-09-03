import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ordersApi, type OrderStatusUpdate } from '@/api/orders'
import { OrderCard } from '@/components/orders/OrderCard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function BuyerOrdersPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: ordersApi.getBuyerOrders,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatusUpdate }) =>
      ordersApi.updateBuyerOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buyer-orders'] }),
  })

  const active = orders?.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED') ?? []
  const past = orders?.filter((o) => o.status === 'COMPLETED' || o.status === 'CANCELLED') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">{t('nav.orders')}</h1>
        <p className="mt-1 text-muted-foreground">{t('orders.buyerSubtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('orders.noOrders')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('orders.activeCount', { count: active.length })}
              </h2>
              {active.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  role="BUYER"
                  isUpdating={updateMutation.isPending && updateMutation.variables?.id === order.id}
                  onUpdateStatus={(id, status) => updateMutation.mutate({ id, status })}
                />
              ))}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('orders.pastOrders')}
              </h2>
              {past.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  role="BUYER"
                  onUpdateStatus={(id, status) => updateMutation.mutate({ id, status })}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
