import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
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
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { marketApi } from '@/api/market'
import { useAuth } from '@/store/auth'
import { TN_DISTRICTS } from '@/constants/districts'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function MarketPricesPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isTamil = i18n.language?.startsWith('ta')

  const [cropName, setCropName] = useState('Tomato')
  const [district, setDistrict] = useState(user?.district || 'Krishnagiri')

  const { data: crops, isLoading: cropsLoading } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  const { data: trendData, isLoading: trendLoading, error } = useQuery({
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
          {t('nav.marketPrices')}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('market.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('market.selectCrop')}</label>
            {cropsLoading ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <Select value={cropName} onChange={(e) => setCropName(e.target.value)}>
                {crops?.map((crop) => (
                  <option key={crop.id} value={crop.name}>
                    {isTamil ? crop.nameTamil : crop.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('profile.district')}</label>
            <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
              {TN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {trendLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : summary ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            <h2 className="font-tamil text-xl font-bold">{cropLabel}</h2>
            <Badge variant="muted">{district}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{t('market.minimum')}</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {formatCurrency(summary.minPrice)}/{summary.unit}
                </p>
              </CardContent>
            </Card>
            <Card className="border-secondary/30 bg-secondary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{t('market.average')}</p>
                <p className="mt-1 text-2xl font-bold text-secondary">
                  {formatCurrency(summary.averagePrice)}/{summary.unit}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{t('market.maximum')}</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {formatCurrency(summary.maxPrice)}/{summary.unit}
                </p>
              </CardContent>
            </Card>
          </div>

          {trendData?.insight && trendData.insight.percentChange !== null && (
            <Card className="border-accent/40 bg-accent/10">
              <CardContent className="flex items-start gap-3 pt-6">
                {trendData.insight.direction === 'higher' && (
                  <TrendingUp className="mt-0.5 h-5 w-5 text-accent" />
                )}
                {trendData.insight.direction === 'lower' && (
                  <TrendingDown className="mt-0.5 h-5 w-5 text-secondary" />
                )}
                {trendData.insight.direction === 'stable' && (
                  <Minus className="mt-0.5 h-5 w-5 text-muted-foreground" />
                )}
                <p className="font-tamil text-sm leading-relaxed sm:text-base">
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
              </CardContent>
            </Card>
          )}

          {trendData?.listingComparison && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('market.listingComparison')}</CardTitle>
                <CardDescription>{t('market.listingComparisonDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('market.yourPrice')}</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(trendData.listingComparison.listingPrice)}/{summary.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('market.average')}</p>
                  <p className="text-lg font-bold text-secondary">
                    {formatCurrency(trendData.listingComparison.marketAverage)}/{summary.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('market.difference')}</p>
                  <p
                    className={`text-lg font-bold ${
                      trendData.listingComparison.difference <= 0 ? 'text-secondary' : 'text-accent'
                    }`}
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
        </>
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
