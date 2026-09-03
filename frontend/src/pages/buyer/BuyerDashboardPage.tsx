import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Inbox, Package, CheckCircle, IndianRupee, ArrowRight, type LucideIcon } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'accent' | 'muted'> = {
  PENDING_CONFIRMATION: 'accent',
  CONFIRMED: 'default',
  IN_TRANSIT: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function BuyerDashboardPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isTamil = i18n.language?.startsWith('ta')

  const { data, isLoading, error } = useQuery({
    queryKey: ['buyer-dashboard'],
    queryFn: dashboardApi.getBuyerDashboard,
  })

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">
          {t('dashboard.buyerWelcome', { name: user?.name ?? user?.organization ?? '' })}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('dashboard.buyerSubtitle')}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label={t('dashboard.pendingRequests')}
              value={data.kpis.pendingRequests}
              icon={Inbox}
            />
            <KpiCard
              label={t('dashboard.activeOrders')}
              value={data.kpis.activeOrders}
              icon={Package}
            />
            <KpiCard
              label={t('dashboard.completedOrders')}
              value={data.kpis.completedOrders}
              icon={CheckCircle}
            />
            <KpiCard
              label={t('dashboard.totalSpent')}
              value={formatCurrency(data.kpis.totalSpent)}
              icon={IndianRupee}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
                <CardDescription>{t('dashboard.recentOrdersDesc')}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/buyer/orders">
                  {t('dashboard.viewAll')}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">{t('orders.noOrders')}</p>
                  <Button className="mt-4" asChild>
                    <Link to="/marketplace">{t('nav.marketplace')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {data.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCropEmoji(order.crop.name)}</span>
                        <div>
                          <p className="font-medium">
                            {isTamil ? order.crop.nameTamil : order.crop.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.farmer.name} · {order.quantity} {order.crop.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={statusVariant[order.status] ?? 'muted'}>
                          {t(`orders.status.${order.status}`)}
                        </Badge>
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" asChild>
              <Link to="/marketplace">{t('nav.marketplace')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/buyer/requests">{t('nav.purchaseRequests')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/buyer/orders">{t('nav.orders')}</Link>
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
