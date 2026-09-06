import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Sprout, Building2, Trophy } from 'lucide-react'
import { adminApi } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { localizedName } from '@/utils/localizedName'
import { formatCurrency, cn } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Skeleton } from '@/components/ui/skeleton'
import { MedalBadge, GrowthChip } from './shared'

export function AdminAnalyticsPreview() {
  const { t, isTamil } = useLocaleText()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminApi.getAnalytics,
  })

  if (isLoading) {
    return <Skeleton className="h-48 rounded-2xl" />
  }

  if (!data) return null

  const topFarmer = data.farmerRankings[0]
  const topBuyer = data.buyerRankings[0]
  const topCrop = data.topSelling.month[0]

  return (
    <button
      type="button"
      onClick={() => navigate('/admin/analytics')}
      className="group w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 text-left shadow-sm transition-all hover:border-primary/35 hover:shadow-md"
    >
      <div className="h-0.5 bg-gradient-to-r from-primary via-secondary/70 to-primary/30" />
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('admin.analyticsSnapshot')}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{t('admin.analyticsSnapshotDesc')}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
            {t('admin.viewFullAnalytics')}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {topFarmer ? (
            <div className="rounded-xl border border-border/70 bg-card/80 p-3.5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Sprout className="h-3.5 w-3.5 text-primary" />
                {t('admin.topFarmer')}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <MedalBadge medal={topFarmer.medal} />
                <p className={cn('truncate font-semibold', isTamil && topFarmer.nameTamil && 'font-tamil')}>
                  {localizedName(topFarmer, isTamil)}
                </p>
              </div>
              <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(topFarmer.totalRevenue ?? 0)}</p>
              <GrowthChip growth={topFarmer.growth} newLabel={t('admin.growthNew')} noActivityLabel={t('admin.growthNoActivity')} />
            </div>
          ) : null}

          {topBuyer ? (
            <div className="rounded-xl border border-border/70 bg-card/80 p-3.5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-secondary" />
                {t('admin.topBuyer')}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <MedalBadge medal={topBuyer.medal} />
                <p className="truncate font-semibold">{topBuyer.name}</p>
              </div>
              <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(topBuyer.totalSpend ?? 0)}</p>
              <GrowthChip growth={topBuyer.growth} newLabel={t('admin.growthNew')} noActivityLabel={t('admin.growthNoActivity')} />
            </div>
          ) : null}

          {topCrop ? (
            <div className="rounded-xl border border-border/70 bg-card/80 p-3.5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-accent-foreground" />
                {t('admin.topCropMonth')}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl">{getCropEmoji(topCrop.cropName)}</span>
                <p className={cn('truncate font-semibold', isTamil && 'font-tamil')}>
                  {isTamil ? topCrop.cropNameTamil : topCrop.cropName}
                </p>
              </div>
              <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(topCrop.revenue)}</p>
              <p className="text-xs text-muted-foreground">
                {topCrop.quantity} {topCrop.unit}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  )
}
