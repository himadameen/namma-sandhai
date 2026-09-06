import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Users,
  Sprout,
  ShoppingBag,
  Package,
  IndianRupee,
  ShieldCheck,
  MessageSquare,
  FileCheck,
  UserX,
  Shield,
} from 'lucide-react'
import { adminApi } from '@/api/admin'
import { useAuth } from '@/store/auth'
import { useLocaleText } from '@/hooks/useLocaleText'
import { formatCurrency, cn } from '@/lib/utils'
import { localizedFarmerName } from '@/utils/localizedName'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AdminChartTooltip,
  AdminKpiCard,
  AdminSectionCard,
  ADMIN_CHART_COLORS,
  ChartFrame,
  EmptyState,
  AdminQueryError,
} from './shared'
import { AdminAnalyticsPreview } from './AdminAnalyticsPreview'

export function AdminOverview() {
  const { user } = useAuth()
  const { t, isTamil, textClass } = useLocaleText()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-[5.5rem] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <AdminQueryError
        message={error instanceof Error ? error.message : t('admin.loadFailed')}
        onRetry={() => refetch()}
        retryLabel={t('common.retry')}
      />
    )
  }

  const { kpis, recentOrders, charts } = data

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-primary to-secondary p-5 text-primary-foreground sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/75">
              {t('admin.overview')}
            </p>
            <h2 className={cn('mt-1 text-xl font-bold sm:text-2xl', textClass)}>
              {t('admin.welcome', { name: user?.name || user?.email || t('panel.roleAdmin') })}
            </h2>
            <p className={cn('mt-2 max-w-2xl text-sm text-primary-foreground/85', textClass)}>
              {t('admin.heroSubtitle')}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Shield className="h-6 w-6" />
          </div>
        </div>
      </section>

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <AdminKpiCard label={t('admin.totalUsers')} value={kpis.totalUsers} icon={Users} />
        <AdminKpiCard label={t('admin.farmers')} value={kpis.farmers} icon={Sprout} accent="secondary" />
        <AdminKpiCard label={t('admin.buyers')} value={kpis.buyers} icon={ShoppingBag} accent="accent" />
        <AdminKpiCard label={t('admin.activeListings')} value={kpis.activeListings} icon={Package} />
        <AdminKpiCard label={t('admin.completedOrders')} value={kpis.completedOrders} icon={Package} accent="secondary" />
        <AdminKpiCard
          label={t('admin.salesVolume')}
          value={formatCurrency(kpis.totalSalesVolume)}
          icon={IndianRupee}
          trend={`${t('admin.monthlyRevenue')}: ${formatCurrency(kpis.monthlyRevenue)} (${
            kpis.revenueGrowth.label === 'new'
              ? t('admin.growthNew')
              : `${(kpis.revenueGrowth.growthPercent ?? 0) >= 0 ? '+' : ''}${kpis.revenueGrowth.growthPercent ?? 0}%`
          })`}
        />
        <AdminKpiCard label={t('admin.pendingVerifications')} value={kpis.pendingVerifications} icon={ShieldCheck} accent="accent" />
        <AdminKpiCard label={t('admin.pendingKyc')} value={kpis.pendingKyc} icon={FileCheck} />
        <AdminKpiCard label={t('admin.openEnquiries')} value={kpis.openEnquiries} icon={MessageSquare} accent="secondary" />
        <AdminKpiCard label={t('admin.inactiveUsers')} value={kpis.inactiveUsers} icon={UserX} accent="destructive" />
      </div>

      <AdminAnalyticsPreview />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminSectionCard title={t('admin.chartUserGrowth')} description={t('admin.chartUserGrowthDesc')}>
          {charts.userGrowth.length ? (
            <ChartFrame>
              <AreaChart data={charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<AdminChartTooltip valuePrefix="" />} />
                <Area type="monotone" dataKey="farmers" name={t('admin.farmers')} stroke={ADMIN_CHART_COLORS[0]} fill={ADMIN_CHART_COLORS[0]} fillOpacity={0.2} />
                <Area type="monotone" dataKey="buyers" name={t('admin.buyers')} stroke={ADMIN_CHART_COLORS[2]} fill={ADMIN_CHART_COLORS[2]} fillOpacity={0.15} />
              </AreaChart>
            </ChartFrame>
          ) : (
            <EmptyState message={t('admin.noChartData')} />
          )}
        </AdminSectionCard>

        <AdminSectionCard title={t('admin.chartSalesTrend')} description={t('admin.chartSalesTrendDesc')}>
          {charts.salesByMonth.length ? (
            <ChartFrame>
              <BarChart data={charts.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<AdminChartTooltip />} />
                <Bar dataKey="revenue" name={t('admin.revenue')} fill={ADMIN_CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartFrame>
          ) : (
            <EmptyState message={t('admin.noChartData')} />
          )}
        </AdminSectionCard>
      </div>

      <AdminSectionCard title={t('admin.recentOrders')} description={t('admin.recentOrdersDesc')}>
        {recentOrders.length === 0 ? (
          <EmptyState message={t('orders.noOrders')} />
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className={cn('font-medium', textClass)}>
                    {isTamil ? order.crop.nameTamil : order.crop.name}
                  </p>
                  <p className="text-muted-foreground">
                    {localizedFarmerName(order.farmerName, order.farmerNameTamil, isTamil)} → {order.buyerName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="muted">{t(`orders.status.${order.status}`)}</Badge>
                  <span className="font-semibold text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSectionCard>
    </div>
  )
}
