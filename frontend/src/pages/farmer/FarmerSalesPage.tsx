import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Search,
  IndianRupee,
  Receipt,
  TrendingDown,
  TrendingUp,
  Minus,
  Sprout,
  CalendarDays,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react'
import { dashboardApi, type SalesCropAggregate } from '@/api/dashboard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useLocaleText } from '@/hooks/useLocaleText'
import { marketApi } from '@/api/market'
import { formatCurrency } from '@/lib/utils'
import { formatDate, getCropEmoji } from '@/utils/listings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { PaginationControls } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

function formatMonthKey(key: string, locale: string) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(locale, {
    month: 'short',
    year: 'numeric',
  })
}

function formatMonthShort(key: string, locale: string) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(locale, {
    month: 'short',
  })
}

function formatMonthLong(month: number, locale: string) {
  return new Date(2000, month - 1, 1).toLocaleDateString(locale, { month: 'long' })
}

function trimZeroRevenueEdges<T extends { revenue: number }>(points: T[]): T[] {
  if (points.length <= 1) return points

  let start = 0
  let end = points.length - 1

  while (start < end && points[start].revenue === 0) start += 1
  while (end > start && points[end].revenue === 0) end -= 1

  return points.slice(start, end + 1)
}

function getPeriodLabel(
  year: string,
  month: string,
  locale: string,
  allTimeLabel: string
) {
  if (year && month) {
    return formatMonthKey(`${year}-${month.padStart(2, '0')}`, locale)
  }
  if (year) return year
  return allTimeLabel
}

function RevenueTrendBadge({
  direction,
  percent,
  profitLabel,
  lossLabel,
  noChangeLabel,
}: {
  direction: 'up' | 'down' | 'stable'
  percent: number | null
  profitLabel: string
  lossLabel: string
  noChangeLabel: string
}) {
  if (percent === null) return null

  const isUp = direction === 'up'
  const isDown = direction === 'down'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-bold tabular-nums',
        isUp && 'border-success/30 bg-success/10 text-success',
        isDown && 'border-destructive/30 bg-destructive/10 text-destructive',
        !isUp && !isDown && 'border-border bg-muted/50 text-muted-foreground'
      )}
    >
      {isUp && <ArrowUp className="h-4 w-4 stroke-[2.5]" aria-hidden />}
      {isDown && <ArrowDown className="h-4 w-4 stroke-[2.5]" aria-hidden />}
      {!isUp && !isDown && <Minus className="h-4 w-4" aria-hidden />}
      <span>
        {isUp ? '+' : isDown ? '-' : ''}
        {Math.abs(percent)}%
      </span>
      <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">
        {isUp ? profitLabel : isDown ? lossLabel : noChangeLabel}
      </span>
    </div>
  )
}

export function FarmerSalesPage() {
  const { t, isTamil, textClass, locale } = useLocaleText()
  const [chartTab, setChartTab] = useState<'monthly' | 'yearly'>('monthly')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [cropFilter, setCropFilter] = useState('')
  const [reportYear, setReportYear] = useState('')
  const [reportMonth, setReportMonth] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const { data: crops } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      cropId: cropFilter || undefined,
      year: reportYear ? Number(reportYear) : undefined,
      month: reportYear && reportMonth ? Number(reportMonth) : undefined,
      search: debouncedSearch || undefined,
    }),
    [page, limit, cropFilter, reportYear, reportMonth, debouncedSearch]
  )

  const exportParams = useMemo(
    () => ({
      year: reportYear ? Number(reportYear) : undefined,
      month: reportYear && reportMonth ? Number(reportMonth) : undefined,
    }),
    [reportYear, reportMonth]
  )

  const periodLabel = useMemo(
    () => getPeriodLabel(reportYear, reportMonth, locale, t('sales.allTime')),
    [reportYear, reportMonth, locale, t]
  )

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['farmer-sales-records', queryParams],
    queryFn: () => dashboardApi.getFarmerSalesRecords(queryParams),
  })

  const exportMutation = useMutation({
    mutationFn: () => dashboardApi.exportFarmerSalesCsv(exportParams),
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    },
  })

  const cropOptions = useMemo(
    () => [
      { value: '', label: t('sales.allCrops') },
      ...(crops?.map((crop) => ({
        value: crop.id,
        label: isTamil ? crop.nameTamil : crop.name,
      })) ?? []),
    ],
    [crops, isTamil, t]
  )

  const yearOptions = useMemo(() => {
    const years = data?.availableYears.length
      ? data.availableYears
      : (data?.yearlyRevenue.map((y) => y.year) ?? [])
    return [
      { value: '', label: t('sales.allYears') },
      ...years.map((year) => ({ value: String(year), label: String(year) })),
    ]
  }, [data?.availableYears, data?.yearlyRevenue, t])

  const monthOptions = useMemo(
    () => [
      { value: '', label: t('sales.allMonths') },
      ...Array.from({ length: 12 }, (_, index) => ({
        value: String(index + 1),
        label: formatMonthLong(index + 1, locale),
      })),
    ],
    [locale, t]
  )

  const monthlyChartData = useMemo(() => {
    const mapped =
      data?.monthlyRevenue.map((point) => ({
        ...point,
        label: formatMonthShort(point.monthKey, locale),
        isSelected:
          reportYear &&
          reportMonth &&
          point.monthKey === `${reportYear}-${reportMonth.padStart(2, '0')}`,
      })) ?? []

    return trimZeroRevenueEdges(mapped)
  }, [data?.monthlyRevenue, locale, reportYear, reportMonth])

  const yearlyChartData = useMemo(
    () =>
      data?.yearlyRevenue.map((point) => ({
        ...point,
        isSelected: reportYear && !reportMonth && String(point.year) === reportYear,
      })) ?? [],
    [data?.yearlyRevenue, reportYear, reportMonth]
  )

  const pagination = data?.pagination
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0
  const hasPeriodFilter = Boolean(reportYear)
  const periodReport = data?.periodReport

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.salesRecords')} description={t('sales.subtitle')} />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : data ? (
        <>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 shadow-card">
            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <p className={cn('text-sm font-semibold text-primary', textClass)}>
                    {t('sales.reportPeriod')}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('sales.reportPeriodDesc')}</p>
                </div>
                <Button
                  variant="outline"
                  className="shrink-0 border-primary/30 bg-card/80 hover:bg-card"
                  onClick={() => exportMutation.mutate()}
                  disabled={
                    exportMutation.isPending ||
                    (hasPeriodFilter
                      ? periodReport?.transactionCount === 0
                      : !data.summary.totalRecords)
                  }
                >
                  {exportMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span className={textClass}>{t('sales.downloadReport')}</span>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <label className="text-sm font-medium leading-none">{t('sales.selectYear')}</label>
                  <DropdownSelect
                    value={reportYear}
                    options={yearOptions}
                    onChange={(value) => {
                      setReportYear(value)
                      if (!value) setReportMonth('')
                      setPage(1)
                      if (value) setChartTab('monthly')
                    }}
                    ariaLabel={t('sales.selectYear')}
                    fullWidth
                    align="left"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <label className="text-sm font-medium leading-none">{t('sales.selectMonth')}</label>
                  <DropdownSelect
                    value={reportMonth}
                    options={monthOptions}
                    onChange={(value) => {
                      setReportMonth(value)
                      setPage(1)
                    }}
                    ariaLabel={t('sales.selectMonth')}
                    fullWidth
                    align="left"
                    disabled={!reportYear}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/90 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t('sales.periodRevenue')} · {periodLabel}
                    </p>
                    <p className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                      {formatCurrency(periodReport?.revenue ?? data.summary.totalRevenue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('sales.periodTransactions', {
                        count: periodReport?.transactionCount ?? data.summary.totalRecords,
                      })}
                      {(periodReport?.quantity ?? 0) > 0 && (
                        <> · {periodReport?.quantity} {t('sales.totalQuantity').toLowerCase()}</>
                      )}
                    </p>
                  </div>

                  {periodReport && periodReport.comparisonType !== 'all_time' && (
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <RevenueTrendBadge
                        direction={periodReport.direction}
                        percent={periodReport.changePercent}
                        profitLabel={t('sales.profit')}
                        lossLabel={t('sales.loss')}
                        noChangeLabel={t('sales.noChange')}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(periodReport.previousRevenue)}{' '}
                        {periodReport.comparisonType === 'previous_month'
                          ? t('sales.vsPreviousMonth')
                          : t('sales.vsPreviousYear')}
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {hasPeriodFilter
                    ? t('sales.downloadReportDesc', { period: periodLabel })
                    : t('sales.downloadReportAll')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: t('dashboard.totalRevenue'),
                value: formatCurrency(data.summary.totalRevenue),
                icon: IndianRupee,
                tone: 'primary' as const,
              },
              {
                label: t('sales.thisMonth'),
                value: formatCurrency(data.summary.currentMonthRevenue),
                icon: CalendarDays,
                tone: 'secondary' as const,
                trend: data.insights.monthOverMonthDirection,
                trendPercent: data.insights.monthOverMonthPercent,
              },
              {
                label: t('sales.thisYear'),
                value: formatCurrency(data.summary.currentYearRevenue),
                icon: BarChart3,
                tone: 'accent' as const,
              },
              {
                label: t('sales.totalRecords'),
                value: String(data.summary.totalRecords),
                icon: Receipt,
                tone: 'muted' as const,
              },
            ].map(({ label, value, icon: Icon, tone, trend, trendPercent }) => (
              <Card key={label} className="border-border/80">
                <CardContent className="flex items-center gap-3.5 p-3.5 sm:p-4">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      tone === 'primary' && 'bg-primary/10 text-primary',
                      tone === 'secondary' && 'bg-secondary/10 text-secondary',
                      tone === 'accent' && 'bg-accent/15 text-accent-foreground',
                      tone === 'muted' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs font-medium text-muted-foreground', textClass)}>
                      {label}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
                      {trend && trendPercent !== null && trendPercent !== undefined && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 text-xs font-bold tabular-nums',
                            trend === 'up' && 'text-success',
                            trend === 'down' && 'text-destructive',
                            trend === 'stable' && 'text-muted-foreground'
                          )}
                        >
                          {trend === 'up' && <ArrowUp className="h-3 w-3" />}
                          {trend === 'down' && <ArrowDown className="h-3 w-3" />}
                          {trend === 'stable' && <Minus className="h-3 w-3" />}
                          {Math.abs(trendPercent)}%
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.insights.monthOverMonthPercent !== null && !hasPeriodFilter && (
            <Card className="border-secondary/30 bg-secondary/5">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      data.insights.monthOverMonthDirection === 'up' &&
                        'bg-success/15 text-success',
                      data.insights.monthOverMonthDirection === 'down' &&
                        'bg-destructive/10 text-destructive',
                      data.insights.monthOverMonthDirection === 'stable' &&
                        'bg-muted text-muted-foreground'
                    )}
                  >
                    {data.insights.monthOverMonthDirection === 'up' && (
                      <TrendingUp className="h-5 w-5" />
                    )}
                    {data.insights.monthOverMonthDirection === 'down' && (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {data.insights.monthOverMonthDirection === 'stable' && (
                      <Minus className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className={cn('text-sm font-medium leading-snug sm:text-base', textClass)}>
                      {t('sales.monthInsight', {
                        percent: Math.abs(data.insights.monthOverMonthPercent),
                        direction:
                          data.insights.monthOverMonthDirection === 'up'
                            ? t('market.higher')
                            : data.insights.monthOverMonthDirection === 'down'
                              ? t('market.lower')
                              : t('market.stable'),
                        current: formatMonthKey(data.insights.currentMonthKey, locale),
                        previous: formatMonthKey(data.insights.previousMonthKey, locale),
                      })}
                    </p>
                    {data.insights.bestYear && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {t('sales.bestYearInsight', {
                          year: data.insights.bestYear,
                          amount: formatCurrency(data.insights.bestYearRevenue),
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-5 xl:items-stretch">
            <Card className="flex h-full flex-col border-border/80 shadow-card xl:col-span-3">
              <CardHeader className="space-y-3 pb-2 pt-6 sm:pt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>{t('sales.revenueTrend')}</CardTitle>
                    <CardDescription>
                      {chartTab === 'monthly'
                        ? reportYear
                          ? t('sales.yearBreakdownDesc', { year: reportYear })
                          : t('sales.monthlyTrendDesc')
                        : t('sales.yearlyTrendDesc')}
                    </CardDescription>
                  </div>
                  <div className="inline-flex rounded-xl border border-border bg-muted/30 p-1">
                    {(['monthly', 'yearly'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setChartTab(tab)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
                          chartTab === tab
                            ? 'bg-card text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {tab === 'monthly' ? t('sales.monthly') : t('sales.yearly')}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col px-5 pb-3 pt-0 sm:px-6 sm:pb-3">
                <div className="min-h-[220px] w-full flex-1 overflow-hidden">
                  {chartTab === 'monthly' && monthlyChartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {t('dashboard.noSalesYet')}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartTab === 'monthly' ? (
                        <BarChart
                          data={monthlyChartData}
                          margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
                          barCategoryGap="18%"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#D4D2C8" vertical={false} />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11 }}
                            stroke="#4A6358"
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            height={18}
                            tickMargin={2}
                            dy={2}
                            padding={{ left: 0, right: 0 }}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#4A6358"
                            tickFormatter={(v) => `₹${Number(v) / 1000}k`}
                            width={44}
                            axisLine={false}
                            tickLine={false}
                          />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #D4D2C8',
                            background: '#FFFFFF',
                          }}
                          formatter={(value) => [
                            `₹${Number(value).toLocaleString('en-IN')}`,
                            t('sales.revenue'),
                          ]}
                          labelFormatter={(_, payload) => {
                            const item = payload?.[0]?.payload as { monthKey?: string }
                            return item?.monthKey ? formatMonthKey(item.monthKey, locale) : ''
                          }}
                        />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={36}>
                          {monthlyChartData.map((entry) => (
                            <Cell
                              key={entry.monthKey}
                              fill={entry.isSelected ? '#164A35' : '#3F8F5F'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                      ) : (
                        <BarChart
                          data={yearlyChartData}
                          margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
                          barCategoryGap="18%"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#D4D2C8" vertical={false} />
                          <XAxis
                            dataKey="year"
                            tick={{ fontSize: 11 }}
                            stroke="#4A6358"
                            axisLine={false}
                            tickLine={false}
                            height={18}
                            tickMargin={2}
                            dy={2}
                            padding={{ left: 0, right: 0 }}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#4A6358"
                            tickFormatter={(v) => `₹${Number(v) / 1000}k`}
                            width={44}
                            axisLine={false}
                            tickLine={false}
                          />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #D4D2C8',
                            background: '#FFFFFF',
                          }}
                          formatter={(value) => [
                            `₹${Number(value).toLocaleString('en-IN')}`,
                            t('sales.revenue'),
                          ]}
                        />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48}>
                          {yearlyChartData.map((entry) => (
                            <Cell
                              key={entry.year}
                              fill={entry.isSelected ? '#164A35' : '#3F8F5F'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-border/80 shadow-card xl:col-span-2">
              <CardHeader className="pt-6 sm:pt-8">
                <CardTitle>
                  {hasPeriodFilter ? t('sales.topCropsForPeriod') : t('sales.topCropsOverall')}
                </CardTitle>
                <CardDescription>
                  {hasPeriodFilter
                    ? t('sales.topCropsForPeriodDesc')
                    : t('sales.topCropsOverallDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-3 pb-6">
                {(hasPeriodFilter ? data.topCropsForPeriod : data.topCropsOverall).length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {hasPeriodFilter ? t('sales.noSalesInPeriod') : t('dashboard.noSalesYet')}
                  </p>
                ) : (
                  (hasPeriodFilter ? data.topCropsForPeriod : data.topCropsOverall).map(
                    (crop, index) => (
                      <TopCropRow
                        key={crop.cropId}
                        crop={crop}
                        rank={index + 1}
                        isTamil={isTamil}
                        totalRevenue={
                          hasPeriodFilter
                            ? (periodReport?.revenue ?? 1)
                            : data.summary.totalRevenue
                        }
                        salesLabel={t('sales.salesCount')}
                      />
                    )
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {!hasPeriodFilter && (
            <div className="grid gap-6 lg:grid-cols-2">
              <TopCropsPanel
                title={t('sales.topCropsThisMonth')}
                subtitle={formatMonthKey(data.insights.currentMonthKey, locale)}
                crops={data.topCropsThisMonth}
                isTamil={isTamil}
                emptyLabel={t('sales.noSalesThisMonth')}
                salesLabel={t('sales.salesCount')}
              />
              <TopCropsPanel
                title={t('sales.topCropsLastMonth')}
                subtitle={formatMonthKey(data.insights.previousMonthKey, locale)}
                crops={data.topCropsLastMonth}
                isTamil={isTamil}
                emptyLabel={t('sales.noSalesLastMonth')}
                salesLabel={t('sales.salesCount')}
              />
            </div>
          )}

          <Card className="border-border/80 shadow-card">
            <CardHeader className="space-y-4 border-b border-border/50 pb-4 pt-6 sm:pt-8">
              <CardTitle>{t('sales.transactionHistory')}</CardTitle>
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-11 pl-10"
                  placeholder={t('sales.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {isFetching && debouncedSearch && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <label className="text-sm font-medium leading-none">{t('sales.filterCrop')}</label>
                  <DropdownSelect
                    value={cropFilter}
                    options={cropOptions}
                    onChange={(value) => {
                      setCropFilter(value)
                      setPage(1)
                    }}
                    ariaLabel={t('sales.filterCrop')}
                    fullWidth
                    align="left"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <label className="text-sm font-medium leading-none">{t('sales.selectYear')}</label>
                  <DropdownSelect
                    value={reportYear}
                    options={yearOptions}
                    onChange={(value) => {
                      setReportYear(value)
                      if (!value) setReportMonth('')
                      setPage(1)
                    }}
                    ariaLabel={t('sales.selectYear')}
                    fullWidth
                    align="left"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <label className="text-sm font-medium leading-none">{t('sales.filterMonth')}</label>
                  <DropdownSelect
                    value={reportMonth}
                    options={monthOptions}
                    onChange={(value) => {
                      setReportMonth(value)
                      setPage(1)
                    }}
                    ariaLabel={t('sales.filterMonth')}
                    fullWidth
                    align="left"
                    disabled={!reportYear}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-5 pt-6 sm:pt-8">
              {data.records.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
                  <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className={cn('text-sm text-muted-foreground', textClass)}>
                    {debouncedSearch || cropFilter || hasPeriodFilter
                      ? t('sales.noMatching')
                      : t('dashboard.noSalesYet')}
                  </p>
                </div>
              ) : (
                <>
                  <div className={cn('space-y-3', isFetching && 'opacity-70')}>
                    {data.records.map((record) => (
                      <article
                        key={record.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card px-4 py-3.5 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="text-2xl">{getCropEmoji(record.crop.name)}</span>
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {isTamil ? record.crop.nameTamil : record.crop.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.buyerName} · {formatDate(record.soldAt, locale)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold tabular-nums text-primary">
                            {formatCurrency(record.totalAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.quantity} {record.unit} @ {formatCurrency(record.price)}/
                            {record.unit}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                  {pagination && (
                    <PaginationControls
                      page={pagination.page}
                      totalPages={pagination.totalPages}
                      total={pagination.total}
                      limit={pagination.limit}
                      onPageChange={setPage}
                      onLimitChange={setLimit}
                      limitOptions={PAGE_SIZE_OPTIONS}
                      labels={{
                        pageSize: t('listings.pageSize'),
                        showing: t('sales.showingRange', { from, to, total: pagination.total }),
                        previous: t('listings.previousPage'),
                        next: t('listings.nextPage'),
                        pageOf: t('listings.pageOf', {
                          page: pagination.page,
                          totalPages: pagination.totalPages,
                        }),
                        perPageOption: (count) => t('listings.perPageOption', { count }),
                      }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

function TopCropsPanel({
  title,
  subtitle,
  crops,
  isTamil,
  emptyLabel,
  salesLabel,
}: {
  title: string
  subtitle: string
  crops: SalesCropAggregate[]
  isTamil: boolean
  emptyLabel: string
  salesLabel: string
}) {
  return (
    <Card className="border-border/80 shadow-card">
      <CardHeader className="pt-6 sm:pt-8">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        {crops.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Sprout className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          </div>
        ) : (
          crops.map((crop, index) => (
            <div
              key={crop.cropId}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-3.5 py-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-lg">{getCropEmoji(crop.cropName)}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {isTamil ? crop.cropNameTamil : crop.cropName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {crop.count} {salesLabel} · {crop.quantity}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-bold tabular-nums text-secondary">
                {formatCurrency(crop.revenue)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function TopCropRow({
  crop,
  rank,
  isTamil,
  totalRevenue,
  salesLabel,
}: {
  crop: SalesCropAggregate
  rank: number
  isTamil: boolean
  totalRevenue: number
  salesLabel: string
}) {
  const share = totalRevenue > 0 ? Math.round((crop.revenue / totalRevenue) * 1000) / 10 : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-base">{getCropEmoji(crop.cropName)}</span>
          <span className="truncate font-semibold">
            {rank}. {isTamil ? crop.cropNameTamil : crop.cropName}
          </span>
        </div>
        <span className="shrink-0 font-bold tabular-nums text-primary">
          {formatCurrency(crop.revenue)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500"
          style={{ width: `${share}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {share}% · {crop.count} {salesLabel}
      </p>
    </div>
  )
}
