import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  Loader2,
  MapPin,
  Building2,
  Tractor,
  CalendarDays,
  IndianRupee,
  Package,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { adminApi, triggerCsvDownload, type AdminTransaction } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { localizedFarmerName } from '@/utils/localizedName'
import { getCropEmoji, formatDate } from '@/utils/listings'
import { TN_DISTRICTS } from '@/constants/districts'
import { formatCurrency, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  getMonthOptions,
  getYearOptions,
  periodToDateRange,
  selectString,
  usePaginationLabels,
} from './helpers'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'accent' | 'muted'> = {
  PENDING_CONFIRMATION: 'accent',
  CONFIRMED: 'default',
  IN_TRANSIT: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

function TransactionCard({
  tx,
  isTamil,
  locale,
  t,
}: {
  tx: AdminTransaction
  isTamil: boolean
  locale: string
  t: (key: string) => string
}) {
  const cropName = isTamil ? tx.crop.nameTamil : tx.crop.name
  const unit = tx.crop.unit ?? 'kg'
  const isActive = tx.status !== 'COMPLETED' && tx.status !== 'CANCELLED'

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md',
        isActive ? 'border-primary/25 shadow-sm' : 'border-border/80'
      )}
    >
      <div className="h-0.5 bg-gradient-to-r from-primary/50 via-secondary/30 to-transparent" />
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="text-2xl">{getCropEmoji(tx.crop.name)}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={cn('text-lg font-bold leading-tight', isTamil && 'font-tamil')}>{cropName}</h3>
                <Badge variant={STATUS_VARIANT[tx.status] ?? 'muted'} className="text-[10px]">
                  {t(`orders.status.${tx.status}`)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(tx.createdAt, locale)} · #{tx.id.slice(-8)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">{formatCurrency(tx.totalAmount)}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(tx.agreedPrice)}/{unit}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
            <Tractor className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.farmer')}
              </p>
              <p className={cn('truncate text-sm font-medium', isTamil && tx.farmerNameTamil && 'font-tamil')}>
                {localizedFarmerName(tx.farmerName, tx.farmerNameTamil, isTamil)}
              </p>
              <p className="truncate text-xs text-muted-foreground">{tx.farmerDistrict}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.buyer')}
              </p>
              <p className="truncate text-sm font-medium">{tx.buyerName}</p>
              <p className="truncate text-xs text-muted-foreground">{tx.buyerDistrict}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            {tx.quantity} {unit}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {tx.district}
          </span>
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {tx.deliveryType === 'DELIVERY' ? t('requests.delivery') : t('requests.pickup')}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {t('admin.updated')}: {formatDate(tx.updatedAt, locale)}
          </span>
        </div>
      </div>
    </article>
  )
}

export function AdminTransactions() {
  const { t, isTamil, locale } = useLocaleText()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const [status, setStatus] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')

  useEffect(() => {
    if (!year) setMonth('')
  }, [year])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const dateRange = useMemo(() => periodToDateRange(year, month), [year, month])

  const filterParams = useMemo(
    () => ({
      search: search || undefined,
      district: district || undefined,
      status: status || undefined,
      from: dateRange.from,
      to: dateRange.to,
    }),
    [search, district, status, dateRange]
  )

  const params = useMemo(() => ({ page, limit, ...filterParams }), [page, limit, filterParams])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-transactions', params],
    queryFn: () => adminApi.getTransactions(params),
  })

  const downloadReport = useMutation({
    mutationFn: () => adminApi.exportTransactions(filterParams),
    onSuccess: ({ blob, filename }) => triggerCsvDownload(blob, filename),
  })

  const pagination = data?.pagination
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0
  const paginationLabels = usePaginationLabels(from, to, pagination?.total ?? 0, pagination?.page ?? 1, pagination?.totalPages ?? 1)

  const yearOptions = useMemo(() => [{ value: '', label: t('admin.allYears') }, ...getYearOptions()], [t])
  const monthOptions = useMemo(
    () => [{ value: '', label: t('admin.allMonths') }, ...getMonthOptions(t)],
    [t]
  )

  return (
    <div className="space-y-5">
      {data?.summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard label={t('admin.totalTransactions')} value={data.summary.totalCount} icon={Package} />
          <AdminKpiCard
            label={t('admin.completedTransactions')}
            value={data.summary.completedCount}
            icon={CheckCircle2}
            accent="secondary"
          />
          <AdminKpiCard
            label={t('admin.totalVolume')}
            value={formatCurrency(data.summary.totalAmount)}
            icon={IndianRupee}
          />
          <AdminKpiCard
            label={t('admin.completedVolume')}
            value={formatCurrency(data.summary.completedAmount)}
            icon={Clock}
            accent="accent"
          />
        </div>
      ) : null}

      <AdminFilterBar>
        <AdminFilterSearch
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.searchTransactions')}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('admin.year')}
          value={year}
          onChange={(v) => {
            selectString(setYear)(v)
            setPage(1)
          }}
          options={yearOptions}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('admin.month')}
          value={month}
          onChange={(v) => {
            selectString(setMonth)(v)
            setPage(1)
          }}
          options={monthOptions}
          disabled={!year}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('profile.district')}
          value={district}
          onChange={(v) => {
            selectString(setDistrict)(v)
            setPage(1)
          }}
          options={[{ value: '', label: t('admin.allDistricts') }, ...TN_DISTRICTS.map((d) => ({ value: d, label: d }))]}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('admin.status')}
          value={status}
          onChange={(v) => {
            selectString(setStatus)(v)
            setPage(1)
          }}
          options={[
            { value: '', label: t('admin.all') },
            { value: 'PENDING_CONFIRMATION', label: t('orders.status.PENDING_CONFIRMATION') },
            { value: 'CONFIRMED', label: t('orders.status.CONFIRMED') },
            { value: 'IN_TRANSIT', label: t('orders.status.IN_TRANSIT') },
            { value: 'COMPLETED', label: t('orders.status.COMPLETED') },
            { value: 'CANCELLED', label: t('orders.status.CANCELLED') },
          ]}
        />
      </AdminFilterBar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {year
            ? month
              ? t('admin.transactionsPeriodMonth', { year, month: monthOptions.find((m) => m.value === month)?.label })
              : t('admin.transactionsPeriodYear', { year })
            : t('admin.transactionsAllTime')}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={downloadReport.isPending}
          onClick={() => downloadReport.mutate()}
        >
          {downloadReport.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t('admin.downloadReport')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl border border-border/60" />
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
            <EmptyState message={t('orders.noOrders')} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.items.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} isTamil={isTamil} locale={locale} t={t} />
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
