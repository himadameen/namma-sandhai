import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Layers,
  MapPin,
  Minus,
  Sprout,
  TrendingDown,
  TrendingUp,
  Warehouse,
} from 'lucide-react'
import { adminApi, type StockChangeItem } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { localizedName } from '@/utils/localizedName'
import { getCropEmoji } from '@/utils/listings'
import { TN_DISTRICTS } from '@/constants/districts'
import { Badge } from '@/components/ui/badge'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { PaginationControls } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  AdminFilterBar,
  AdminFilterSearch,
  AdminKpiCard,
  AdminQueryError,
  EmptyState,
} from './shared'
import { selectString, usePaginationLabels } from './helpers'
import { cn } from '@/lib/utils'

type DirectionFilter = '' | 'up' | 'down' | 'stable'

function QuantityBar({
  label,
  quantity,
  maxQuantity,
  variant,
}: {
  label: string
  quantity: number
  maxQuantity: number
  variant: 'yesterday' | 'today'
}) {
  const pct = maxQuantity > 0 ? Math.min(100, Math.round((quantity / maxQuantity) * 100)) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{quantity}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            variant === 'yesterday' ? 'bg-muted-foreground/35' : 'bg-gradient-to-r from-primary/80 to-primary'
          )}
          style={{ width: `${Math.max(pct, quantity > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  )
}

function StockChangeCard({
  item,
  isTamil,
  t,
}: {
  item: StockChangeItem
  isTamil: boolean
  t: (key: string) => string
}) {
  const cropName = isTamil ? item.crop.nameTamil : item.crop.name
  const maxQty = Math.max(item.yesterdayQuantity, item.currentQuantity, 1)
  const directionStyles = {
    up: {
      border: 'border-emerald-500/25',
      accent: 'from-emerald-500/60 via-emerald-400/20 to-transparent',
      badge: 'success' as const,
      icon: TrendingUp,
      iconClass: 'text-emerald-600',
    },
    down: {
      border: 'border-red-500/25',
      accent: 'from-red-500/60 via-red-400/20 to-transparent',
      badge: 'destructive' as const,
      icon: TrendingDown,
      iconClass: 'text-red-600',
    },
    stable: {
      border: 'border-border/80',
      accent: 'from-muted-foreground/30 via-muted/20 to-transparent',
      badge: 'muted' as const,
      icon: Minus,
      iconClass: 'text-muted-foreground',
    },
  }
  const style = directionStyles[item.direction]
  const DirectionIcon = style.icon

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md',
        style.border
      )}
    >
      <div className={cn('h-0.5 bg-gradient-to-r', style.accent)} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-2xl">
            {getCropEmoji(item.crop.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className={cn('truncate text-base font-bold', isTamil && 'font-tamil')}>{cropName}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sprout className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className={cn('truncate', isTamil && item.farmer.nameTamil && 'font-tamil')}>
                    {localizedName(item.farmer, isTamil)}
                  </span>
                </div>
              </div>
              <Badge variant={style.badge} className="shrink-0 gap-1">
                <DirectionIcon className={cn('h-3 w-3', style.iconClass)} />
                {item.change > 0 ? '+' : ''}
                {item.change} {item.unit}
              </Badge>
            </div>

            <div className="mt-4 rounded-xl border border-border/60 bg-muted/15 p-3">
              <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.stockComparison')}
              </p>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <QuantityBar
                  label={t('admin.yesterdayQty')}
                  quantity={item.yesterdayQuantity}
                  maxQuantity={maxQty}
                  variant="yesterday"
                />
                <ArrowRight className="mx-auto hidden h-4 w-4 text-muted-foreground sm:block" />
                <QuantityBar
                  label={t('admin.todayQty')}
                  quantity={item.currentQuantity}
                  maxQuantity={maxQty}
                  variant="today"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {item.district}
              </span>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  item.direction === 'up' && 'text-emerald-600',
                  item.direction === 'down' && 'text-red-600',
                  item.direction === 'stable' && 'text-muted-foreground'
                )}
              >
                {item.changePercent > 0 ? '+' : ''}
                {item.changePercent}%
                <span className="ml-1 font-normal text-muted-foreground">{t('admin.sinceYesterday')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function AdminStock() {
  const { t, isTamil } = useLocaleText()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const [direction, setDirection] = useState<DirectionFilter>('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const params = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      district: district || undefined,
      direction: direction || undefined,
    }),
    [page, limit, search, district, direction]
  )

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-stock', params],
    queryFn: () => adminApi.getStockChanges(params),
  })

  const pagination = data?.pagination
  const summary = data?.summary
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0
  const paginationLabels = usePaginationLabels(
    from,
    to,
    pagination?.total ?? 0,
    pagination?.page ?? 1,
    pagination?.totalPages ?? 1
  )

  const directionTabs: { id: DirectionFilter; label: string; count?: number }[] = [
    { id: '', label: t('admin.stockFilterAll'), count: summary?.totalListings },
    { id: 'up', label: t('admin.stockFilterUp'), count: summary?.increased },
    { id: 'down', label: t('admin.stockFilterDown'), count: summary?.decreased },
    { id: 'stable', label: t('admin.stockFilterStable'), count: summary?.unchanged },
  ]

  if (isError) {
    return (
      <AdminQueryError
        message={error instanceof Error ? error.message : t('admin.loadFailed')}
        onRetry={() => refetch()}
        retryLabel={t('common.retry')}
      />
    )
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[5.5rem] rounded-2xl" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminKpiCard label={t('admin.stockTracked')} value={summary.totalListings} icon={Warehouse} />
          <AdminKpiCard
            label={t('admin.stockIncreased')}
            value={summary.increased}
            icon={TrendingUp}
            accent="secondary"
          />
          <AdminKpiCard
            label={t('admin.stockDecreased')}
            value={summary.decreased}
            icon={TrendingDown}
            accent="destructive"
          />
          <AdminKpiCard label={t('admin.stockUnchanged')} value={summary.unchanged} icon={Layers} />
          <AdminKpiCard
            label={t('admin.stockNetChange')}
            value={`${summary.netChange > 0 ? '+' : ''}${summary.netChange}`}
            icon={ArrowRight}
            accent="accent"
          />
        </div>
      ) : null}

      <AdminFilterBar>
        <AdminFilterSearch
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.searchListings')}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('profile.district')}
          value={district}
          onChange={selectString((v) => {
            setDistrict(v)
            setPage(1)
          })}
          options={[
            { value: '', label: t('admin.allDistricts') },
            ...TN_DISTRICTS.map((d) => ({ value: d, label: d })),
          ]}
        />
      </AdminFilterBar>

      <div className="inline-flex max-w-full flex-wrap gap-2">
        {directionTabs.map((tab) => (
          <button
            key={tab.id || 'all'}
            type="button"
            onClick={() => {
              setDirection(tab.id)
              setPage(1)
            }}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              direction === tab.id
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                  direction === tab.id ? 'bg-primary-foreground/20' : 'bg-muted'
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {pagination ? (
        <p className="text-sm text-muted-foreground">
          {t('admin.stockShowing', { count: pagination.total })}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <Card>
          <CardContent>
            <EmptyState message={t('admin.noStockData')} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item) => (
            <StockChangeCard key={item.listingId} item={item} isTamil={isTamil} t={t} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <Card>
          <CardContent className="py-4">
            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              onLimitChange={(v) => {
                setLimit(v)
                setPage(1)
              }}
              labels={paginationLabels}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
