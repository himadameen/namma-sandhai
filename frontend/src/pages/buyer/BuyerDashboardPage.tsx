import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState, type ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Inbox,
  Package,
  CheckCircle,
  IndianRupee,
  ArrowRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  BadgeCheck,
  Store,
  ShoppingBag,
  MapPin,
  BadgeCheck as VerifiedIcon,
} from 'lucide-react'
import { dashboardApi, type OrdersByStatus } from '@/api/dashboard'
import { useAuth } from '@/store/auth'
import { useLocaleText } from '@/hooks/useLocaleText'
import { formatDisplayId } from '@/utils/displayId'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CHART_COLORS = ['#3F8F5F', '#164A35', '#D9A441', '#6ee7a8', '#fbbf24', '#94a89c']
const SPENDING_SHARE_TOP_CROPS = 5
const RECENT_ORDERS_LIMIT = 5
const CHART_HEIGHT = 280

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'accent' | 'muted'> = {
  PENDING_CONFIRMATION: 'accent',
  CONFIRMED: 'default',
  IN_TRANSIT: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

type SpendingShareSlice = {
  name: string
  spent: number
  value: number
  sharePercent: number
}

function buildSpendingShareData(
  spendingByCrop: { cropName: string; cropNameTamil: string; spent: number; sharePercent: number }[],
  totalSpent: number,
  isTamil: boolean,
  othersLabel: string
): SpendingShareSlice[] {
  if (!spendingByCrop.length || totalSpent <= 0) return []

  const sorted = [...spendingByCrop].sort((a, b) => b.spent - a.spent)
  const topItems = sorted.slice(0, SPENDING_SHARE_TOP_CROPS)
  const restItems = sorted.slice(SPENDING_SHARE_TOP_CROPS)

  const slices: SpendingShareSlice[] = topItems.map((item) => ({
    name: isTamil ? item.cropNameTamil : item.cropName,
    spent: item.spent,
    value: item.spent,
    sharePercent: item.sharePercent,
  }))

  if (restItems.length > 0) {
    const othersSpent = restItems.reduce((sum, item) => sum + item.spent, 0)
    slices.push({
      name: othersLabel,
      spent: othersSpent,
      value: othersSpent,
      sharePercent: Math.round((othersSpent / totalSpent) * 1000) / 10,
    })
  }

  const percentSum = slices.reduce((sum, item) => sum + item.sharePercent, 0)
  if (slices.length > 0 && percentSum !== 100) {
    slices[0] = {
      ...slices[0],
      sharePercent: Math.round((slices[0].sharePercent + (100 - percentSum)) * 10) / 10,
    }
  }

  return slices
}

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  accent = 'primary',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  href: string
  accent?: 'primary' | 'secondary' | 'accent'
}) {
  const colors = {
    primary: 'from-primary/15 to-primary/5 text-primary',
    secondary: 'from-secondary/15 to-secondary/5 text-secondary',
    accent: 'from-accent/20 to-accent/5 text-accent-foreground',
  }

  return (
    <Link
      to={href}
      className="group block rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br', colors[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </Link>
  )
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  tone,
  textClass,
}: {
  title: string
  description: string
  icon: LucideIcon
  href: string
  tone: 'primary' | 'secondary' | 'accent' | 'outline'
  textClass: string
}) {
  const tones = {
    primary: 'border-primary/20 bg-primary/[0.06] hover:bg-primary/[0.1]',
    secondary: 'border-secondary/20 bg-secondary/[0.06] hover:bg-secondary/[0.1]',
    accent: 'border-accent/25 bg-accent/[0.08] hover:bg-accent/[0.14]',
    outline: 'border-border bg-background hover:bg-muted/50',
  }
  const iconTones = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
    outline: 'bg-muted text-foreground',
  }

  return (
    <Link
      to={href}
      className={cn(
        'cta-interactive group flex flex-col rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card sm:p-5',
        tones[tone]
      )}
    >
      <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', iconTones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className={cn('font-bold text-foreground', textClass)}>{title}</p>
      <p className={cn('mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm', textClass)}>{description}</p>
      <span className={cn('mt-3 inline-flex items-center text-xs font-semibold text-primary', textClass)}>
        Open
        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function ChartFrame({
  children,
  className,
  height = CHART_HEIGHT,
}: {
  children: ReactElement
  className?: string
  height?: number
}) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-elevated">
      {label && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

function SpendingShareTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: SpendingShareSlice }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-elevated">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="mt-1 text-muted-foreground">{formatCurrency(item.spent)}</p>
      <p className="mt-0.5 font-semibold text-primary">{item.sharePercent}%</p>
    </div>
  )
}

function SpendingSharePanel({
  data,
  totalSpent,
  textClass,
  totalLabel,
}: {
  data: SpendingShareSlice[]
  totalSpent: number
  textClass: string
  totalLabel: string
}) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
      <div className="relative mx-auto h-[11rem] w-[11rem] shrink-0 sm:h-[12.5rem] sm:w-[12.5rem] lg:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              {CHART_COLORS.map((color, index) => (
                <linearGradient key={color} id={`buyerShareGrad${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.72} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={`url(#buyerShareGrad${index % CHART_COLORS.length})`}
                  className="cursor-pointer outline-none transition-opacity duration-200"
                  opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.35}
                />
              ))}
            </Pie>
            <Tooltip content={<SpendingShareTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{totalLabel}</p>
          <p className="mt-1 text-sm font-bold leading-snug text-foreground">{formatCurrency(totalSpent)}</p>
          {activeIndex != null && data[activeIndex] && (
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-primary">{data[activeIndex].sharePercent}%</p>
          )}
        </div>
      </div>

      <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((item, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length]
          const isActive = activeIndex === index

          return (
            <button
              key={item.name}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                isActive
                  ? 'border-primary/25 bg-primary/[0.06] shadow-sm'
                  : 'border-border/50 bg-muted/25 hover:border-primary/20 hover:bg-muted/40'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span className={cn('truncate text-xs font-semibold leading-snug text-foreground', textClass)}>{item.name}</span>
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-primary">{item.sharePercent}%</span>
              </div>
              <div className="my-1.5 h-1 overflow-hidden rounded-full bg-background/80">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${item.sharePercent}%`, backgroundColor: color }}
                />
              </div>
              <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">{formatCurrency(item.spent)}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

type OrderStatusItem = {
  key: string
  label: string
  value: number
  color: string
  iconBg: string
  icon: LucideIcon
}

function OrdersByStatusPanel({
  ordersByStatus,
  textClass,
  labels,
  totalOrdersLabel,
}: {
  ordersByStatus: OrdersByStatus
  textClass: string
  labels: {
    pending: string
    confirmed: string
    inTransit: string
    completed: string
  }
  totalOrdersLabel: string
}) {
  const items: OrderStatusItem[] = [
    { key: 'pending', label: labels.pending, value: ordersByStatus.pending, color: '#D9A441', iconBg: 'bg-accent/15', icon: Clock },
    { key: 'confirmed', label: labels.confirmed, value: ordersByStatus.confirmed, color: '#3F8F5F', iconBg: 'bg-secondary/15', icon: CheckCircle2 },
    { key: 'inTransit', label: labels.inTransit, value: ordersByStatus.inTransit, color: '#164A35', iconBg: 'bg-primary/10', icon: Truck },
    { key: 'completed', label: labels.completed, value: ordersByStatus.completed, color: '#2D6A4F', iconBg: 'bg-success/15', icon: BadgeCheck },
  ].filter((item) => item.value > 0)

  const total = items.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Package className="h-4 w-4" />
        </div>
        <div>
          <p className={cn('text-[11px] font-medium leading-relaxed text-muted-foreground', textClass)}>{totalOrdersLabel}</p>
          <p className="text-xl font-bold leading-snug text-foreground">{total}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0
          const Icon = item.icon

          return (
            <div
              key={item.key}
              className="rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2 transition-colors hover:border-primary/20 hover:bg-primary/[0.03]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', item.iconBg)}>
                    <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                  </div>
                  <span className={cn('truncate text-xs font-semibold leading-snug text-foreground', textClass)}>{item.label}</span>
                </div>
                <div className="flex shrink-0 items-baseline gap-1">
                  <span className="text-base font-bold tabular-nums text-foreground">{item.value}</span>
                  <span className="text-[10px] font-medium leading-relaxed text-muted-foreground">{percent}%</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/80">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function BuyerDashboardPage() {
  const { user } = useAuth()
  const { t, isTamil, textClass, locale } = useLocaleText()
  const [chartTab, setChartTab] = useState<'monthly' | 'trend'>('monthly')

  const { data, isLoading, error } = useQuery({
    queryKey: ['buyer-dashboard'],
    queryFn: dashboardApi.getBuyerDashboard,
  })

  const spendingShareData = useMemo(
    () =>
      data
        ? buildSpendingShareData(
            data.spendingByCrop,
            data.kpis.totalSpent,
            isTamil,
            t('dashboard.spendingShareOthers')
          )
        : [],
    [data, isTamil, t]
  )

  const orderStatusLabels = {
    pending: t('dashboard.statusPending'),
    confirmed: t('dashboard.statusConfirmed'),
    inTransit: t('dashboard.statusInTransit'),
    completed: t('dashboard.statusCompleted'),
  }

  const hasOrders =
    data &&
    (data.ordersByStatus.pending > 0 ||
      data.ordersByStatus.confirmed > 0 ||
      data.ordersByStatus.inTransit > 0 ||
      data.ordersByStatus.completed > 0)

  const displayId = formatDisplayId(user?.buyerId, user?.role)
  const displayName = user?.organization ?? user?.name ?? ''
  const monthlyChartData = data?.monthlySpending ?? []
  const recentOrdersPreview = data?.recentOrders.slice(0, RECENT_ORDERS_LIMIT) ?? []

  const trendChartData = useMemo(() => {
    if (!monthlyChartData.length) return []
    return monthlyChartData.map((point) => ({
      month: point.month,
      spent: point.spent,
    }))
  }, [monthlyChartData])

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-primary to-secondary p-5 text-primary-foreground sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-white/5 blur-xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/75">
              {t('dashboard.todayOverview')}
            </p>
            <h1 className={cn('mt-1 text-2xl font-bold sm:text-3xl', textClass)}>
              {t('dashboard.buyerWelcome', { name: displayName })}
            </h1>
            <p className={cn('mt-2 max-w-xl text-sm text-primary-foreground/85', textClass)}>
              {t('dashboard.buyerSubtitle')}
            </p>
            <p className="mt-3 font-mono text-xs font-semibold text-primary-foreground/70">{displayId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" className={cn('bg-white/15 text-white hover:bg-white/25', textClass)} asChild>
              <Link to="/buyer/marketplace">
                <Store className="mr-1.5 h-4 w-4" />
                {t('dashboard.browseMarketplace')}
              </Link>
            </Button>
            <Button size="sm" variant="secondary" className={cn('bg-white/15 text-white hover:bg-white/25', textClass)} asChild>
              <Link to="/buyer/requests">
                <Inbox className="mr-1.5 h-4 w-4" />
                {t('dashboard.buyerRequests')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className={cn('mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground', textClass)}>
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title={t('dashboard.browseMarketplace')}
            description={t('dashboard.browseMarketplaceDesc')}
            icon={Store}
            href="/buyer/marketplace"
            tone="primary"
            textClass={textClass}
          />
          <QuickActionCard
            title={t('dashboard.buyerRequests')}
            description={t('dashboard.buyerRequestsDesc')}
            icon={Inbox}
            href="/buyer/requests"
            tone="accent"
            textClass={textClass}
          />
          <QuickActionCard
            title={t('dashboard.trackOrders')}
            description={t('dashboard.trackOrdersDesc')}
            icon={Package}
            href="/buyer/orders"
            tone="secondary"
            textClass={textClass}
          />
          <QuickActionCard
            title={t('nav.profile')}
            description={t('dashboard.buyerProfileDesc')}
            icon={ShoppingBag}
            href="/buyer/profile"
            tone="outline"
            textClass={textClass}
          />
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label={t('dashboard.pendingRequests')}
              value={data.kpis.pendingRequests}
              icon={Inbox}
              href="/buyer/requests"
              accent="accent"
            />
            <KpiCard
              label={t('dashboard.activeOrders')}
              value={data.kpis.activeOrders}
              icon={Package}
              href="/buyer/orders"
            />
            <KpiCard
              label={t('dashboard.completedOrders')}
              value={data.kpis.completedOrders}
              icon={CheckCircle}
              href="/buyer/orders"
              accent="secondary"
            />
            <KpiCard
              label={t('dashboard.totalSpent')}
              value={formatCurrency(data.kpis.totalSpent)}
              icon={IndianRupee}
              href="/buyer/orders"
              accent="secondary"
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-1">
              <div className="space-y-2.5">
                <CardTitle className={textClass}>{t('dashboard.buyerPerformance')}</CardTitle>
                <CardDescription className={textClass}>
                  {chartTab === 'monthly' ? t('dashboard.monthlySpendingDesc') : t('dashboard.monthlySpendingDesc')}
                </CardDescription>
              </div>
              <div className="flex rounded-lg border border-border p-0.5">
                {(['monthly', 'trend'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setChartTab(tab)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                      chartTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab === 'monthly' ? t('dashboard.monthlySpending') : t('dashboard.weeklyTrend')}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pb-5 pt-0">
              {monthlyChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
                  <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground/60" />
                  <p className={cn('text-sm text-muted-foreground', textClass)}>{t('dashboard.noPurchasesYet')}</p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link to="/buyer/marketplace">{t('dashboard.browseMarketplace')}</Link>
                  </Button>
                </div>
              ) : chartTab === 'monthly' ? (
                <ChartFrame>
                  <BarChart data={monthlyChartData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={4} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(63,143,95,0.08)' }} />
                    <Bar dataKey="spent" fill="#3F8F5F" radius={[8, 8, 0, 0]} maxBarSize={64} />
                  </BarChart>
                </ChartFrame>
              ) : (
                <ChartFrame>
                  <AreaChart data={trendChartData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="buyerSpendingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3F8F5F" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3F8F5F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={4} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="spent" stroke="#164A35" fill="url(#buyerSpendingGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#164A35' }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ChartFrame>
              )}
            </CardContent>
          </Card>

          {spendingShareData.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="space-y-2.5 border-b border-border/50 bg-gradient-to-br from-primary/[0.04] to-transparent pb-4">
                <CardTitle className={textClass}>{t('dashboard.spendingByCrop')}</CardTitle>
                <CardDescription className={textClass}>{t('dashboard.spendingByCropDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="pb-5 pt-5">
                <SpendingSharePanel
                  data={spendingShareData}
                  totalSpent={data.kpis.totalSpent}
                  textClass={textClass}
                  totalLabel={t('dashboard.totalSpent')}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid items-start gap-6 lg:grid-cols-5">
            <Card className="self-start lg:col-span-3">
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-1">
                <div className="space-y-2.5">
                  <CardTitle className={textClass}>{t('dashboard.recentOrders')}</CardTitle>
                  <CardDescription className={textClass}>
                    {t('dashboard.ordersSummary', {
                      count: data.kpis.totalOrders,
                      spent: formatCurrency(data.kpis.totalSpent),
                    })}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className={textClass}>
                  <Link to="/buyer/orders">
                    {t('dashboard.viewAll')}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pb-5">
                {recentOrdersPreview.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
                    <Package className="mb-2 h-7 w-7 text-muted-foreground/60" />
                    <p className={cn('text-sm leading-relaxed text-muted-foreground', textClass)}>{t('orders.noOrders')}</p>
                    <Button className="mt-4" size="sm" asChild>
                      <Link to="/buyer/marketplace">{t('dashboard.browseMarketplace')}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentOrdersPreview.map((order) => (
                      <Link
                        key={order.id}
                        to="/buyer/orders"
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/[0.04] hover:shadow-sm"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="text-2xl">{getCropEmoji(order.crop.name)}</span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className={cn('truncate font-semibold', textClass)}>
                                {isTamil ? order.crop.nameTamil : order.crop.name}
                              </p>
                              <Badge variant={statusVariant[order.status] ?? 'muted'} className="text-[10px]">
                                {t(`orders.status.${order.status}`)}
                              </Badge>
                            </div>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 truncate text-xs text-muted-foreground">
                              <span>{order.farmer.name}</span>
                              {order.farmer.isVerified && (
                                <VerifiedIcon className="inline h-3 w-3 text-secondary" aria-label="Verified" />
                              )}
                              <span>·</span>
                              <span className="inline-flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {order.farmer.district}
                              </span>
                              <span>·</span>
                              <span>
                                {order.quantity} {order.crop.unit}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(order.updatedAt).toLocaleDateString(locale)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="self-start lg:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-1">
                <div className="space-y-2.5">
                  <CardTitle className={textClass}>{t('dashboard.ordersByStatus')}</CardTitle>
                  <CardDescription className={textClass}>{t('dashboard.ordersByStatusDesc')}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className={cn('shrink-0', textClass)}>
                  <Link to="/buyer/orders">
                    {t('dashboard.viewAll')}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pb-5">
                {!hasOrders ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
                    <Package className="mb-2 h-7 w-7 text-muted-foreground/60" />
                    <p className={cn('text-sm leading-relaxed text-muted-foreground', textClass)}>{t('orders.noOrders')}</p>
                  </div>
                ) : (
                  <OrdersByStatusPanel
                    ordersByStatus={data.ordersByStatus}
                    textClass={textClass}
                    labels={orderStatusLabels}
                    totalOrdersLabel={t('dashboard.totalOrders')}
                  />
                )}
                <Button variant="outline" className={cn('mt-4 w-full', textClass)} asChild>
                  <Link to="/buyer/orders">
                    <Package className="mr-2 h-4 w-4" />
                    {t('dashboard.trackOrders')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
