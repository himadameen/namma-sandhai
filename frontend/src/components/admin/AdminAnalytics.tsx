import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Sprout, BarChart3, PieChartIcon, TrendingUp, Package, ShoppingCart, MessageSquare } from 'lucide-react'
import { adminApi, type RankingEntry, type TopSellingItem } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { localizedName } from '@/utils/localizedName'
import { formatCurrency, cn } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AdminChartTooltip,
  AdminSectionCard,
  ADMIN_CHART_COLORS,
  ChartFrame,
  EmptyState,
  GrowthChip,
  MedalBadge,
  AdminQueryError,
} from './shared'

type AnalyticsTab = 'rankings' | 'products' | 'breakdown'

function statusLabel(status: string, t: (key: string) => string, kind: 'orders' | 'listings' | 'requests') {
  if (kind === 'orders') return t(`orders.status.${status}`)
  if (kind === 'listings') return t(`listings.status.${status}`)
  return t(`requests.status.${status}`)
}

function RankingCard({
  row,
  maxValue,
  valueKey,
  isTamil,
  momLabel,
  growthLabels,
}: {
  row: RankingEntry
  maxValue: number
  valueKey: 'totalRevenue' | 'totalSpend'
  isTamil: boolean
  momLabel: string
  growthLabels: { new: string; noActivity: string }
}) {
  const value = row[valueKey] ?? 0
  const pct = maxValue > 0 ? Math.min(100, Math.round((value / maxValue) * 100)) : 0

  return (
    <article className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center gap-1.5">
          <MedalBadge medal={row.medal} size={row.medal ? 'md' : 'sm'} />
          <span className="text-[11px] font-bold text-muted-foreground">#{row.rank}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-semibold', isTamil && row.nameTamil && 'font-tamil')}>
            {valueKey === 'totalRevenue' ? localizedName(row, isTamil) : row.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{row.district}</p>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-primary">{formatCurrency(value)}</p>
          <GrowthChip
            growth={row.growth}
            momLabel={row.growth.label === 'change' ? momLabel : undefined}
            newLabel={growthLabels.new}
            noActivityLabel={growthLabels.noActivity}
          />
        </div>
      </div>
    </article>
  )
}

function ProductPodium({
  items,
  isTamil,
}: {
  items: TopSellingItem[]
  isTamil: boolean
}) {
  const podium = items.slice(0, 3)
  const order = podium.length >= 3 ? [podium[1], podium[0], podium[2]] : podium

  return (
    <div className="flex items-end justify-center gap-3 px-2 pb-2 pt-4 sm:gap-5">
      {order.map((item) => {
        if (!item) return null
        const rank = item.rank
        const heightClass = rank === 1 ? 'h-28' : rank === 2 ? 'h-20' : rank === 3 ? 'h-16' : 'h-14'
        const cropName = isTamil ? item.cropNameTamil : item.cropName

        return (
          <div key={item.cropId} className="flex max-w-[7.5rem] flex-1 flex-col items-center">
            <span className="mb-1 text-2xl">{getCropEmoji(item.cropName)}</span>
            <MedalBadge
              medal={rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'}
              size="sm"
            />
            <p className={cn('mt-1.5 line-clamp-2 text-center text-xs font-semibold', isTamil && 'font-tamil')}>
              {cropName}
            </p>
            <p className="mt-0.5 text-sm font-bold text-primary">{formatCurrency(item.revenue)}</p>
            <div
              className={cn(
                'mt-2 w-full rounded-t-xl bg-gradient-to-t from-primary/25 to-primary/10',
                heightClass
              )}
            />
          </div>
        )
      })}
    </div>
  )
}

function TopProductRow({
  item,
  maxRevenue,
  isTamil,
}: {
  item: TopSellingItem
  maxRevenue: number
  isTamil: boolean
}) {
  const pct = maxRevenue > 0 ? Math.min(100, Math.round((item.revenue / maxRevenue) * 100)) : 0
  const cropName = isTamil ? item.cropNameTamil : item.cropName

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 transition-all hover:border-primary/30 hover:shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-lg">
        {getCropEmoji(item.cropName)}
      </span>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        #{item.rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-sm font-semibold', isTamil && 'font-tamil')}>{cropName}</p>
          <span className="shrink-0 text-sm font-bold text-primary">{formatCurrency(item.revenue)}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary/70 to-secondary transition-all duration-500 group-hover:from-primary/70 group-hover:to-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {item.quantity} {item.unit} · {item.orderCount} orders
        </p>
      </div>
    </div>
  )
}

function BreakdownPanel({
  title,
  data,
  kind,
  t,
  icon: Icon,
}: {
  title: string
  data: { status: string; count: number }[]
  kind: 'orders' | 'listings' | 'requests'
  t: (key: string) => string
  icon: typeof Package
}) {
  const [activeStatus, setActiveStatus] = useState<string | null>(null)

  const chartData = data.map((d) => ({
    ...d,
    label: statusLabel(d.status, t, kind),
  }))
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const activeEntry = chartData.find((d) => d.status === activeStatus)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{total} total</p>
        </div>
      </div>

      {data.length ? (
        <div className="p-4 sm:p-5">
          <div className="relative mx-auto mb-4" style={{ height: 180, maxWidth: 180 }}>
            <ChartFrame height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  onClick={(_, index) => setActiveStatus(chartData[index]?.status ?? null)}
                  className="cursor-pointer outline-none"
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.status}
                      fill={ADMIN_CHART_COLORS[i % ADMIN_CHART_COLORS.length]}
                      opacity={activeStatus && activeStatus !== entry.status ? 0.35 : 1}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value ?? 0, name]} />
              </PieChart>
            </ChartFrame>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">{activeEntry?.count ?? total}</span>
              <span className="max-w-[5rem] truncate text-[10px] text-muted-foreground">
                {activeEntry?.label ?? t('admin.breakdownTotal')}
              </span>
            </div>
          </div>

          <ul className="space-y-2">
            {chartData.map((entry, i) => {
              const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
              const isActive = activeStatus === entry.status
              return (
                <li key={entry.status}>
                  <button
                    type="button"
                    onClick={() => setActiveStatus(isActive ? null : entry.status)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all',
                      isActive
                        ? 'border-primary/40 bg-primary/5 shadow-sm'
                        : 'border-border/50 bg-muted/10 hover:border-primary/25 hover:bg-muted/25'
                    )}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: ADMIN_CHART_COLORS[i % ADMIN_CHART_COLORS.length] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{entry.label}</span>
                    <span className="shrink-0 text-sm font-bold tabular-nums">{entry.count}</span>
                    <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{pct}%</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <EmptyState message={t('admin.noChartData')} />
      )}
    </div>
  )
}

export function AdminAnalytics() {
  const { t, isTamil } = useLocaleText()
  const [tab, setTab] = useState<AnalyticsTab>('rankings')
  const [topPeriod, setTopPeriod] = useState<'day' | 'month' | 'year'>('month')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminApi.getAnalytics,
  })

  const topItems = useMemo(() => {
    if (!data) return []
    return topPeriod === 'day' ? data.topSelling.day : topPeriod === 'month' ? data.topSelling.month : data.topSelling.year
  }, [data, topPeriod])

  const maxFarmerRevenue = useMemo(
    () => Math.max(...(data?.farmerRankings.map((r) => r.totalRevenue ?? 0) ?? [0]), 1),
    [data]
  )
  const maxBuyerSpend = useMemo(
    () => Math.max(...(data?.buyerRankings.map((r) => r.totalSpend ?? 0) ?? [0]), 1),
    [data]
  )
  const maxProductRevenue = useMemo(() => Math.max(...topItems.map((i) => i.revenue), 1), [topItems])

  const growthLabels = { new: t('admin.growthNew'), noActivity: t('admin.growthNoActivity') }
  const momLabel = t('admin.growthMoM')

  const tabs: { id: AnalyticsTab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'rankings', label: t('admin.tabRankings'), icon: Sprout },
    { id: 'products', label: t('admin.tabProducts'), icon: BarChart3 },
    { id: 'breakdown', label: t('admin.tabBreakdown'), icon: PieChartIcon },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
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

  return (
    <div className="space-y-5">
      <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-border/80 bg-muted/30 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'rankings' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminSectionCard title={t('admin.topFarmers')} description={t('admin.topFarmersDesc')}>
            {data.farmerRankings.length ? (
              <div className="space-y-3">
                {data.farmerRankings.map((row) => (
                  <RankingCard
                    key={row.rank}
                    row={row}
                    maxValue={maxFarmerRevenue}
                    valueKey="totalRevenue"
                    isTamil={isTamil}
                    momLabel={momLabel}
                    growthLabels={growthLabels}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message={t('admin.noRankingData')} />
            )}
          </AdminSectionCard>

          <AdminSectionCard title={t('admin.topBuyers')} description={t('admin.topBuyersDesc')}>
            {data.buyerRankings.length ? (
              <div className="space-y-3">
                {data.buyerRankings.map((row) => (
                  <RankingCard
                    key={row.rank}
                    row={row}
                    maxValue={maxBuyerSpend}
                    valueKey="totalSpend"
                    isTamil={isTamil}
                    momLabel={momLabel}
                    growthLabels={growthLabels}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message={t('admin.noRankingData')} />
            )}
          </AdminSectionCard>
        </div>
      ) : null}

      {tab === 'products' ? (
        <AdminSectionCard
          title={t('admin.topSellingItems')}
          description={t('admin.topSellingItemsDesc')}
          actions={
            <div className="inline-flex rounded-lg border border-border/80 bg-muted/30 p-0.5">
              {(['day', 'month', 'year'] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={topPeriod === p ? 'default' : 'ghost'}
                  className="h-8 rounded-md px-3"
                  onClick={() => setTopPeriod(p)}
                >
                  {t(`admin.period.${p}`)}
                </Button>
              ))}
            </div>
          }
        >
          {topItems.length ? (
            <div className="space-y-6">
              {topItems.length >= 2 ? (
                <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-transparent">
                  <div className="flex items-center gap-2 px-4 pt-4">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">{t('admin.topProductsPodium')}</p>
                  </div>
                  <ProductPodium items={topItems} isTamil={isTamil} />
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                <ChartFrame height={300}>
                  <BarChart
                    data={topItems.map((item) => ({
                      ...item,
                      label: isTamil ? item.cropNameTamil : item.cropName,
                    }))}
                    layout="vertical"
                    margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="label" width={92} tick={{ fontSize: 11 }} />
                    <Tooltip content={<AdminChartTooltip />} />
                    <Bar dataKey="revenue" name={t('admin.revenue')} radius={[0, 8, 8, 0]}>
                      {topItems.map((_, i) => (
                        <Cell key={i} fill={ADMIN_CHART_COLORS[i % ADMIN_CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartFrame>
                <div className="space-y-2">
                  {topItems.map((item) => (
                    <TopProductRow key={item.cropId} item={item} maxRevenue={maxProductRevenue} isTamil={isTamil} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState message={t('admin.noChartData')} />
          )}
        </AdminSectionCard>
      ) : null}

      {tab === 'breakdown' ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <BreakdownPanel
            title={t('admin.ordersBreakdown')}
            data={data.usageStats.ordersByStatus}
            kind="orders"
            t={t}
            icon={ShoppingCart}
          />
          <BreakdownPanel
            title={t('admin.listingsBreakdown')}
            data={data.usageStats.listingsByStatus}
            kind="listings"
            t={t}
            icon={Package}
          />
          <BreakdownPanel
            title={t('admin.requestsBreakdown')}
            data={data.usageStats.requestsByStatus}
            kind="requests"
            t={t}
            icon={MessageSquare}
          />
        </div>
      ) : null}
    </div>
  )
}
