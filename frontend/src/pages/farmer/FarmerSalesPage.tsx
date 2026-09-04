import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Download,
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

export function FarmerSalesPage() {
  const { t, isTamil, textClass, locale } = useLocaleText()
  const [chartTab, setChartTab] = useState<'monthly' | 'yearly'>('monthly')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [cropFilter, setCropFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
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
      year: yearFilter ? Number(yearFilter) : undefined,
      search: debouncedSearch || undefined,
    }),
    [page, limit, cropFilter, yearFilter, debouncedSearch]
  )

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['farmer-sales-records', queryParams],
    queryFn: () => dashboardApi.getFarmerSalesRecords(queryParams),
  })

  const exportMutation = useMutation({
    mutationFn: dashboardApi.exportFarmerSalesCsv,
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
    const years = data?.yearlyRevenue.map((y) => y.year) ?? []
    return [
      { value: '', label: t('sales.allYears') },
      ...years.map((year) => ({ value: String(year), label: String(year) })),
    ]
  }, [data?.yearlyRevenue, t])

  const monthlyChartData = useMemo(
    () =>
      data?.monthlyRevenue.map((point) => ({
        ...point,
        label: formatMonthShort(point.monthKey, locale),
      })) ?? [],
    [data?.monthlyRevenue, locale]
  )

  const yearlyChartData = data?.yearlyRevenue ?? []
  const pagination = data?.pagination
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.salesRecords')}
        description={t('sales.subtitle')}
        actions={
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending || !data?.summary.totalRecords}
            className={textClass}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {t('sales.exportCsv')}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : data ? (
        <>
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
            ].map(({ label, value, icon: Icon, tone }) => (
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
                  <div className="min-w-0">
                    <p className={cn('text-xs font-medium text-muted-foreground', textClass)}>{label}</p>
                    <p className="mt-0.5 text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.insights.monthOverMonthPercent !== null && (
            <Card className="border-secondary/30 bg-secondary/5">
              <CardContent className="flex items-start gap-3 pt-6">
                {data.insights.monthOverMonthDirection === 'up' && (
                  <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                )}
                {data.insights.monthOverMonthDirection === 'down' && (
                  <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                )}
                {data.insights.monthOverMonthDirection === 'stable' && (
                  <Minus className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="space-y-1">
                  <p className={cn('text-sm leading-relaxed sm:text-base', textClass)}>
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
                    <p className="text-xs text-muted-foreground">
                      {t('sales.bestYearInsight', {
                        year: data.insights.bestYear,
                        amount: formatCurrency(data.insights.bestYearRevenue),
                      })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-5">
            <Card className="border-border/80 shadow-card xl:col-span-3">
              <CardHeader className="space-y-3 pt-6 sm:pt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>{t('sales.revenueTrend')}</CardTitle>
                    <CardDescription>
                      {chartTab === 'monthly' ? t('sales.monthlyTrendDesc') : t('sales.yearlyTrendDesc')}
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
              <CardContent className="pb-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartTab === 'monthly' ? (
                      <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D4D2C8" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#4A6358" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#4A6358" unit=" ₹" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #D4D2C8',
                            background: '#FFFFFF',
                          }}
                          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, t('sales.revenue')]}
                          labelFormatter={(_, payload) => {
                            const item = payload?.[0]?.payload as { monthKey?: string }
                            return item?.monthKey ? formatMonthKey(item.monthKey, locale) : ''
                          }}
                        />
                        <Bar dataKey="revenue" fill="#3F8F5F" radius={[6, 6, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    ) : (
                      <BarChart data={yearlyChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D4D2C8" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#4A6358" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#4A6358" unit=" ₹" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #D4D2C8',
                            background: '#FFFFFF',
                          }}
                          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, t('sales.revenue')]}
                        />
                        <Bar dataKey="revenue" fill="#164A35" radius={[6, 6, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-card xl:col-span-2">
              <CardHeader className="pt-6 sm:pt-8">
                <CardTitle>{t('sales.topCropsOverall')}</CardTitle>
                <CardDescription>{t('sales.topCropsOverallDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {data.topCropsOverall.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">{t('dashboard.noSalesYet')}</p>
                ) : (
                  data.topCropsOverall.map((crop, index) => (
                    <TopCropRow
                      key={crop.cropId}
                      crop={crop}
                      rank={index + 1}
                      isTamil={isTamil}
                      totalRevenue={data.summary.totalRevenue}
                      salesLabel={t('sales.salesCount')}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

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
              <div className="grid gap-3 sm:grid-cols-2">
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
                  <label className="text-sm font-medium leading-none">{t('sales.filterYear')}</label>
                  <DropdownSelect
                    value={yearFilter}
                    options={yearOptions}
                    onChange={(value) => {
                      setYearFilter(value)
                      setPage(1)
                    }}
                    ariaLabel={t('sales.filterYear')}
                    fullWidth
                    align="left"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-5 pt-6 sm:pt-8">
              {data.records.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
                  <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className={cn('text-sm text-muted-foreground', textClass)}>
                    {debouncedSearch || cropFilter || yearFilter
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
                          <p className="font-bold text-primary tabular-nums">
                            {formatCurrency(record.totalAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.quantity} {record.unit} @ {formatCurrency(record.price)}/{record.unit}
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
              <p className="shrink-0 font-bold text-secondary tabular-nums">
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
      <p className="text-xs text-muted-foreground">{share}% · {crop.count} {salesLabel}</p>
    </div>
  )
}
