import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  TrendingDown,
  TrendingUp,
  Minus,
  MapPin,
  Loader2,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { marketApi } from '@/api/market'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useLocaleText } from '@/hooks/useLocaleText'
import { useAuth } from '@/store/auth'
import { TN_DISTRICTS } from '@/constants/districts'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const CROP_SCROLL_STEP = 220

export function MarketPricesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isTamil, textClass } = useLocaleText()

  const [cropName, setCropName] = useState('Tomato')
  const [district, setDistrict] = useState(user?.district || 'Krishnagiri')
  const cropScrollRef = useRef<HTMLDivElement>(null)
  const [cropScrollState, setCropScrollState] = useState({ atStart: true, atEnd: true })

  const updateCropScrollState = useCallback(() => {
    const el = cropScrollRef.current
    if (!el) return
    setCropScrollState({
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    })
  }, [])

  const scrollCropsToStart = () => {
    cropScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }

  const scrollCropsLeft = () => {
    cropScrollRef.current?.scrollBy({ left: -CROP_SCROLL_STEP, behavior: 'smooth' })
  }

  const scrollCropsRight = () => {
    cropScrollRef.current?.scrollBy({ left: CROP_SCROLL_STEP, behavior: 'smooth' })
  }

  const scrollCropsToEnd = () => {
    const el = cropScrollRef.current
    if (!el) return
    el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
  }

  const { data: crops, isLoading: cropsLoading } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  useEffect(() => {
    updateCropScrollState()
    window.addEventListener('resize', updateCropScrollState)
    return () => window.removeEventListener('resize', updateCropScrollState)
  }, [crops, updateCropScrollState])

  const { data: trendData, isLoading: trendLoading, isFetching, error } = useQuery({
    queryKey: ['market-trend', cropName, district],
    queryFn: () => marketApi.getTrend({ crop: cropName, district, days: 7 }),
    enabled: !!cropName && !!district,
  })

  const chartData = useMemo(
    () =>
      trendData?.trend.map((point) => ({
        date: new Date(point.date).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
          month: 'short',
          day: 'numeric',
        }),
        average: point.averagePrice,
        min: point.minPrice,
        max: point.maxPrice,
      })) ?? [],
    [trendData, isTamil]
  )

  const selectedCrop = crops?.find((c) => c.name === cropName)
  const cropLabel = isTamil && selectedCrop?.nameTamil ? selectedCrop.nameTamil : cropName
  const summary = trendData?.summary

  const cropOptions = useMemo(
    () =>
      crops?.map((crop) => ({
        value: crop.name,
        label: isTamil ? crop.nameTamil : crop.name,
      })) ?? [],
    [crops, isTamil]
  )

  const districtOptions = useMemo(
    () => TN_DISTRICTS.map((d) => ({ value: d, label: d })),
    []
  )

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.marketPrices')} description={t('market.subtitle')} />

      {/* Hero / context */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-secondary px-5 py-6 text-white shadow-elevated sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {t('market.heroBadge')}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl">{getCropEmoji(cropName)}</span>
              <h2 className={cn('font-tamil text-2xl font-bold sm:text-3xl', textClass)}>{cropLabel}</h2>
              <Badge className="border-white/25 bg-white/15 text-white">{district}</Badge>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-white/85">
              <MapPin className="h-4 w-4 shrink-0" />
              {t('market.sevenDayTrend')}
            </p>
          </div>
          {summary && (
            <div className="rounded-xl bg-white/12 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs font-medium text-white/75">{t('market.average')}</p>
              <p className="mt-0.5 text-3xl font-bold tabular-nums">
                {formatCurrency(summary.averagePrice)}
                <span className="text-base font-semibold text-white/80">/{summary.unit}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filters + quick crops + price summary */}
      <Card className="border-border/80 shadow-card">
        <CardContent className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <label htmlFor="market-crop-select" className="text-sm font-medium leading-none">
                {t('market.selectCrop')}
              </label>
              {cropsLoading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <DropdownSelect
                  value={cropName}
                  options={cropOptions}
                  onChange={setCropName}
                  ariaLabel={t('market.selectCrop')}
                  fullWidth
                  align="left"
                  className="w-full"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label htmlFor="market-district-select" className="text-sm font-medium leading-none">
                {t('profile.district')}
              </label>
              <DropdownSelect
                value={district}
                options={districtOptions}
                onChange={setDistrict}
                ariaLabel={t('profile.district')}
                fullWidth
                align="left"
                className="w-full"
              />
            </div>
          </div>

          {crops && crops.length > 0 && (
            <div className="space-y-3 border-t border-border/60 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('market.quickCrops')}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full text-xs font-bold"
                    onClick={scrollCropsToStart}
                    disabled={cropScrollState.atStart}
                    aria-label={t('market.scrollToFirst')}
                  >
                    {'<<'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full text-xs font-bold"
                    onClick={scrollCropsLeft}
                    disabled={cropScrollState.atStart}
                    aria-label={t('market.scrollPrevious')}
                  >
                    {'<'}
                  </Button>
                </div>
                <div
                  ref={cropScrollRef}
                  onScroll={updateCropScrollState}
                  className="flex min-w-0 flex-1 items-center gap-2 overflow-x-hidden scroll-smooth"
                >
                  {crops.map((crop) => {
                    const selected = cropName === crop.name
                    const label = isTamil ? crop.nameTamil : crop.name
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => setCropName(crop.name)}
                        className={cn(
                          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-all',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-muted/30 hover:border-primary/30 hover:bg-primary/5'
                        )}
                      >
                        <span>{getCropEmoji(crop.name)}</span>
                        <span className="whitespace-nowrap">{label}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full text-xs font-bold"
                    onClick={scrollCropsRight}
                    disabled={cropScrollState.atEnd}
                    aria-label={t('market.scrollNext')}
                  >
                    {'>'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full text-xs font-bold"
                    onClick={scrollCropsToEnd}
                    disabled={cropScrollState.atEnd}
                    aria-label={t('market.scrollToEnd')}
                  >
                    {'>>'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isFetching && !trendLoading && (
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t('market.updating')}
            </p>
          )}

          {trendLoading ? (
            <div className="grid gap-4 border-t border-border/60 pt-5 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[5.5rem] rounded-xl" />
              ))}
            </div>
          ) : summary ? (
            <div className={cn('space-y-4 border-t border-border/60 pt-5', isFetching && 'opacity-70')}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex h-full min-h-[5.5rem] items-center gap-3 rounded-xl border border-border/80 bg-card p-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{t('market.minimum')}</p>
                    <p className="mt-0.5 text-xl font-bold text-primary sm:text-2xl">
                      {formatCurrency(summary.minPrice)}/{summary.unit}
                    </p>
                  </div>
                </div>
                <div className="flex h-full min-h-[5.5rem] items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{t('market.average')}</p>
                    <p className="mt-0.5 text-xl font-bold text-secondary sm:text-2xl">
                      {formatCurrency(summary.averagePrice)}/{summary.unit}
                    </p>
                  </div>
                </div>
                <div className="flex h-full min-h-[5.5rem] items-center gap-3 rounded-xl border border-border/80 bg-card p-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{t('market.maximum')}</p>
                    <p className="mt-0.5 text-xl font-bold text-primary sm:text-2xl">
                      {formatCurrency(summary.maxPrice)}/{summary.unit}
                    </p>
                  </div>
                </div>
              </div>

              {trendData?.insight && trendData.insight.percentChange !== null && (
                <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 sm:p-5">
                  {trendData.insight.direction === 'higher' && (
                    <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  )}
                  {trendData.insight.direction === 'lower' && (
                    <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  )}
                  {trendData.insight.direction === 'stable' && (
                    <Minus className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <p className={cn('text-sm leading-relaxed sm:text-base', textClass)}>
                    {t('market.insight', {
                      percent: Math.abs(trendData.insight.percentChange),
                      direction:
                        trendData.insight.direction === 'higher'
                          ? t('market.higher')
                          : trendData.insight.direction === 'lower'
                            ? t('market.lower')
                            : t('market.stable'),
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {trendLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : summary ? (
        <div className={cn('space-y-6', isFetching && 'opacity-70')}>
          {trendData?.listingComparison && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('market.listingComparison')}</CardTitle>
                <CardDescription>{t('market.listingComparisonDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">{t('market.yourPrice')}</p>
                  <p className="mt-1 text-lg font-bold">
                    {formatCurrency(trendData.listingComparison.listingPrice)}/{summary.unit}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/10 p-4">
                  <p className="text-xs text-muted-foreground">{t('market.average')}</p>
                  <p className="mt-1 text-lg font-bold text-secondary">
                    {formatCurrency(trendData.listingComparison.marketAverage)}/{summary.unit}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">{t('market.difference')}</p>
                  <p
                    className={cn(
                      'mt-1 text-lg font-bold',
                      trendData.listingComparison.difference <= 0 ? 'text-secondary' : 'text-accent'
                    )}
                  >
                    {trendData.listingComparison.difference > 0 ? '+' : ''}
                    {formatCurrency(trendData.listingComparison.difference)}/{summary.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('market.sevenDayTrend')}</CardTitle>
              <CardDescription>
                {cropLabel} — {district}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4D2C8" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#4A6358" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#4A6358" unit=" ₹" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #D4D2C8',
                          background: '#FFFFFF',
                        }}
                        formatter={(value) => [`₹${Number(value).toFixed(0)}`, '']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="average"
                        name={t('market.average')}
                        stroke="#3F8F5F"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="min"
                        name={t('market.minimum')}
                        stroke="#164A35"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="max"
                        name={t('market.maximum')}
                        stroke="#D9A441"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-muted-foreground">{t('market.noData')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('market.noData')}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
