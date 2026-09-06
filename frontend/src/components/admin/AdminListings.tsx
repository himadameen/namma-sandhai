import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  Package,
  Sprout,
  TrendingDown,
  TrendingUp,
  Layers,
} from 'lucide-react'
import { adminApi, type AdminFarmerListingGroup, type AdminGroupedListingItem } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { localizedName } from '@/utils/localizedName'
import { getCropEmoji } from '@/utils/listings'
import { TN_DISTRICTS } from '@/constants/districts'
import { formatCurrency, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { PaginationControls } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { AdminFilterBar, AdminFilterSearch, AdminKpiCard, AdminQueryError, EmptyState } from './shared'
import { selectString, usePaginationLabels } from './helpers'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'muted'> = {
  ACTIVE: 'success',
  SOLD: 'default',
  EXPIRED: 'destructive',
}

function StockBar({ quantity, maxQuantity }: { quantity: number; maxQuantity: number }) {
  const pct = maxQuantity > 0 ? Math.min(100, Math.round((quantity / maxQuantity) * 100)) : 0
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function ProductListingCard({
  listing,
  maxQuantity,
  isTamil,
  t,
}: {
  listing: AdminGroupedListingItem
  maxQuantity: number
  isTamil: boolean
  t: (key: string) => string
}) {
  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name
  const isActive = listing.status === 'ACTIVE'

  return (
    <article className="rounded-xl border border-border/70 bg-card p-3.5 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getCropEmoji(listing.crop.name)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className={cn('truncate font-semibold', isTamil && 'font-tamil')}>{cropName}</h4>
              <p className="text-xs text-muted-foreground">{listing.crop.category}</p>
            </div>
            <Badge variant={STATUS_VARIANT[listing.status] ?? 'muted'} className="shrink-0 text-[10px]">
              {t(`listings.status.${listing.status}`)}
            </Badge>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('admin.stockAvailable')}</span>
              <span className="font-semibold tabular-nums">
                {listing.quantity} {listing.unit}
              </span>
            </div>
            {isActive ? <StockBar quantity={listing.quantity} maxQuantity={maxQuantity} /> : null}

            {listing.stock.direction && listing.stock.change !== null ? (
              <div className="flex items-center gap-1.5 text-[11px]">
                {listing.stock.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : listing.stock.direction === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                ) : null}
                <span
                  className={cn(
                    'font-medium',
                    listing.stock.direction === 'up' && 'text-emerald-600',
                    listing.stock.direction === 'down' && 'text-red-600',
                    listing.stock.direction === 'stable' && 'text-muted-foreground'
                  )}
                >
                  {listing.stock.change > 0 ? '+' : ''}
                  {listing.stock.change} {listing.unit}
                  {listing.stock.changePercent !== null ? ` (${listing.stock.changePercent}%)` : ''}
                </span>
                <span className="text-muted-foreground">{t('admin.sinceYesterday')}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-sm">
            <span className="font-semibold text-primary">
              {formatCurrency(listing.expectedPrice)}
              <span className="text-xs font-normal text-muted-foreground">/{listing.unit}</span>
            </span>
            <span className="text-xs text-muted-foreground">{listing.district}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function FarmerListingGroupCard({
  group,
  isTamil,
  t,
  expanded,
  onToggle,
}: {
  group: AdminFarmerListingGroup
  isTamil: boolean
  t: (key: string) => string
  expanded: boolean
  onToggle: () => void
}) {
  const farmerName = localizedName(group.farmer, isTamil)
  const maxQuantity = Math.max(...group.listings.map((l) => l.quantity), 1)
  const initial = farmerName.trim().charAt(0).toUpperCase() || '?'

  return (
    <Card className="overflow-hidden border-border/80">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/20 sm:p-5"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary ring-1 ring-primary/15">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className={cn('text-lg font-semibold leading-tight', isTamil && 'font-tamil')}>{farmerName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {group.farmer.district}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {group.farmer.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {group.farmer.phone}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {group.farmer.isVerified ? (
                <Badge variant="success" className="text-[10px]">
                  {t('common.verified')}
                </Badge>
              ) : null}
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.products')}
              </p>
              <p className="text-sm font-semibold tabular-nums">{group.stats.productCount}</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.activeProducts')}
              </p>
              <p className="text-sm font-semibold tabular-nums">{group.stats.activeCount}</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.totalStock')}
              </p>
              <p className="text-sm font-semibold tabular-nums">{group.stats.totalStock}</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.stockValue')}
              </p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(group.stats.totalValue)}</p>
            </div>
          </div>
        </div>
      </button>

      {expanded ? (
        <CardContent className="border-t border-border/60 bg-muted/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.listings.map((listing) => (
              <ProductListingCard
                key={listing.id}
                listing={listing}
                maxQuantity={maxQuantity}
                isTamil={isTamil}
                t={t}
              />
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}

export function AdminListings() {
  const { t, isTamil } = useLocaleText()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(8)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const [status, setStatus] = useState('')
  const [expandedFarmers, setExpandedFarmers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const params = useMemo(
    () => ({ page, limit, search: search || undefined, district: district || undefined, status: status || undefined }),
    [page, limit, search, district, status]
  )

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-listings-grouped', params],
    queryFn: () => adminApi.getListingsGrouped(params),
  })

  useEffect(() => {
    if (!data?.items.length) return
    setExpandedFarmers((prev) => {
      const next = { ...prev }
      for (const group of data.items) {
        if (next[group.farmer.id] === undefined) next[group.farmer.id] = true
      }
      return next
    })
  }, [data?.items])

  const pagination = data?.pagination
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0
  const paginationLabels = usePaginationLabels(from, to, pagination?.total ?? 0, pagination?.page ?? 1, pagination?.totalPages ?? 1)

  const allExpanded = data?.items.every((g) => expandedFarmers[g.farmer.id] !== false) ?? false

  return (
    <div className="space-y-5">
      {data?.summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminKpiCard label={t('admin.farmersWithProducts')} value={data.summary.farmerCount} icon={Sprout} />
          <AdminKpiCard label={t('admin.totalProducts')} value={data.summary.productCount} icon={Layers} accent="secondary" />
          <AdminKpiCard label={t('admin.totalStockUnits')} value={data.summary.totalStock} icon={Package} accent="accent" />
        </div>
      ) : null}

      <AdminFilterBar>
        <AdminFilterSearch value={searchInput} onChange={setSearchInput} placeholder={t('admin.searchListings')} />
        <DropdownSelect
          size="md"
          ariaLabel={t('profile.district')}
          value={district}
          onChange={selectString(setDistrict)}
          options={[{ value: '', label: t('admin.allDistricts') }, ...TN_DISTRICTS.map((d) => ({ value: d, label: d }))]}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('admin.status')}
          value={status}
          onChange={selectString(setStatus)}
          options={[
            { value: '', label: t('admin.all') },
            { value: 'ACTIVE', label: t('listings.status.ACTIVE') },
            { value: 'SOLD', label: t('listings.status.SOLD') },
            { value: 'EXPIRED', label: t('listings.status.EXPIRED') },
          ]}
        />
      </AdminFilterBar>

      {data?.items.length ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (!data.items.length) return
              const next = !allExpanded
              setExpandedFarmers(Object.fromEntries(data.items.map((g) => [g.farmer.id, next])))
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            {allExpanded ? t('admin.collapseAll') : t('admin.expandAll')}
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl border border-border/60" />
          ))}
        </div>
      ) : isError ? (
        <AdminQueryError
          message={error instanceof Error ? error.message : t('admin.loadFailed')}
          onRetry={() => refetch()}
          retryLabel={t('common.retry')}
        />
      ) : !data?.items.length ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState message={t('admin.noListingsFound')} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.items.map((group) => (
            <FarmerListingGroupCard
              key={group.farmer.id}
              group={group}
              isTamil={isTamil}
              t={t}
              expanded={expandedFarmers[group.farmer.id] !== false}
              onToggle={() =>
                setExpandedFarmers((prev) => ({
                  ...prev,
                  [group.farmer.id]: !(prev[group.farmer.id] !== false),
                }))
              }
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
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
      ) : null}
    </div>
  )
}
