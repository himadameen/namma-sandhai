import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  Check,
  X,
  RefreshCw,
  Loader2,
  Search,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Truck,
  Package,
  MapPin,
  Building2,
  IndianRupee,
  CalendarDays,
} from 'lucide-react'
import {
  purchaseRequestsApi,
  type PurchaseRequest,
  type PurchaseRequestStatus,
  type DeliveryType,
} from '@/api/purchaseRequests'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useLocaleText } from '@/hooks/useLocaleText'
import { marketApi } from '@/api/market'
import { formatCurrency } from '@/lib/utils'
import { formatDate, getCropEmoji } from '@/utils/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { PaginationControls } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

const statusVariant: Record<
  PurchaseRequestStatus,
  'default' | 'success' | 'destructive' | 'accent' | 'muted'
> = {
  PENDING: 'accent',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  COUNTERED: 'default',
}

type StatusFilter = '' | PurchaseRequestStatus
type DeliveryFilter = '' | DeliveryType

export function FarmerRequestsPage() {
  const { t, isTamil, textClass, locale } = useLocaleText()
  const queryClient = useQueryClient()
  const [counteringId, setCounteringId] = useState<string | null>(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [cropFilter, setCropFilter] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('')
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
      status: statusFilter || undefined,
      cropId: cropFilter || undefined,
      deliveryType: deliveryFilter || undefined,
      search: debouncedSearch || undefined,
    }),
    [page, limit, statusFilter, cropFilter, deliveryFilter, debouncedSearch]
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['farmer-requests', queryParams],
    queryFn: () => purchaseRequestsApi.getFarmerRequests(queryParams),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['farmer-requests'] })

  const acceptMutation = useMutation({
    mutationFn: purchaseRequestsApi.accept,
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: purchaseRequestsApi.reject,
    onSuccess: invalidate,
  })

  const counterMutation = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) =>
      purchaseRequestsApi.counter(id, { offeredPrice: price }),
    onSuccess: () => {
      setCounteringId(null)
      setCounterPrice('')
      invalidate()
    },
  })

  const requests = data?.requests ?? []
  const pagination = data?.pagination
  const summary = data?.summary
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  const cropOptions = useMemo(
    () => [
      { value: '', label: t('requests.allCrops') },
      ...(crops?.map((crop) => ({
        value: crop.id,
        label: isTamil ? crop.nameTamil : crop.name,
      })) ?? []),
    ],
    [crops, isTamil, t]
  )

  const deliveryOptions = useMemo(
    () => [
      { value: '', label: t('requests.allDelivery') },
      { value: 'PICKUP', label: t('requests.pickup') },
      { value: 'DELIVERY', label: t('requests.delivery') },
    ],
    [t]
  )

  const statusTabs: { key: StatusFilter; label: string; count?: number }[] = [
    { key: '', label: t('requests.allStatuses'), count: summary?.total },
    { key: 'PENDING', label: t('requests.status.PENDING'), count: summary?.pending },
    { key: 'COUNTERED', label: t('requests.status.COUNTERED'), count: summary?.countered },
    { key: 'ACCEPTED', label: t('requests.status.ACCEPTED'), count: summary?.accepted },
    { key: 'REJECTED', label: t('requests.status.REJECTED'), count: summary?.rejected },
  ]

  const isActing =
    acceptMutation.isPending || rejectMutation.isPending || counterMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.purchaseRequests')} description={t('requests.farmerSubtitle')} />

      {summary && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: t('requests.totalRequests'),
              value: summary.total,
              icon: Inbox,
              tone: 'primary' as const,
            },
            {
              label: t('requests.actionRequired'),
              value: summary.actionRequired,
              icon: Clock,
              tone: 'accent' as const,
            },
            {
              label: t('requests.status.ACCEPTED'),
              value: summary.accepted,
              icon: CheckCircle2,
              tone: 'secondary' as const,
            },
            {
              label: t('requests.status.REJECTED'),
              value: summary.rejected,
              icon: XCircle,
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
                  <p className="mt-0.5 text-2xl font-bold tabular-nums">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border/80 shadow-card">
        <CardHeader className="space-y-4 border-b border-border/50 pb-4 pt-6 sm:pt-8">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-10"
              placeholder={t('requests.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isFetching && debouncedSearch && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-medium leading-none">{t('requests.filterCrop')}</label>
              <DropdownSelect
                value={cropFilter}
                options={cropOptions}
                onChange={(value) => {
                  setCropFilter(value)
                  setPage(1)
                }}
                ariaLabel={t('requests.filterCrop')}
                fullWidth
                align="left"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-medium leading-none">{t('requests.filterDelivery')}</label>
              <DropdownSelect
                value={deliveryFilter}
                options={deliveryOptions}
                onChange={(value) => {
                  setDeliveryFilter(value as DeliveryFilter)
                  setPage(1)
                }}
                ariaLabel={t('requests.filterDelivery')}
                fullWidth
                align="left"
              />
            </div>
          </div>

          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-muted/30 p-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key || 'all'}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key)
                  setPage(1)
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  statusFilter === tab.key
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className={textClass}>{tab.label}</span>
                {tab.count != null && (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                      statusFilter === tab.key
                        ? 'bg-primary/10 text-primary'
                        : 'bg-background text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-5 pt-6 sm:pt-8">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: limit }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className={cn('text-sm text-muted-foreground', textClass)}>
                {debouncedSearch || statusFilter || cropFilter || deliveryFilter
                  ? t('requests.noMatching')
                  : t('requests.noIncoming')}
              </p>
            </div>
          ) : (
            <>
              {summary && summary.actionRequired > 0 && !statusFilter && (
                <p className="text-sm font-medium text-accent">
                  {t('requests.pendingCount', { count: summary.actionRequired })}
                </p>
              )}

              <div className={cn('space-y-3', isFetching && 'opacity-70')}>
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    isTamil={isTamil}
                    locale={locale}
                    textClass={textClass}
                    t={t}
                    counteringId={counteringId}
                    counterPrice={counterPrice}
                    onCounterPriceChange={setCounterPrice}
                    onStartCounter={(id, price) => {
                      setCounteringId(id)
                      setCounterPrice(String(price))
                    }}
                    onCancelCounter={() => setCounteringId(null)}
                    onAccept={() => acceptMutation.mutate(request.id)}
                    onReject={() => rejectMutation.mutate(request.id)}
                    onSubmitCounter={() =>
                      counterMutation.mutate({ id: request.id, price: Number(counterPrice) })
                    }
                    isActing={isActing}
                  />
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
                    showing: t('listings.showingRange', { from, to, total: pagination.total }),
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
    </div>
  )
}

function RequestCard({
  request,
  isTamil,
  locale,
  textClass,
  t,
  counteringId,
  counterPrice,
  onCounterPriceChange,
  onStartCounter,
  onCancelCounter,
  onAccept,
  onReject,
  onSubmitCounter,
  isActing,
}: {
  request: PurchaseRequest
  isTamil: boolean
  locale: string
  textClass: string
  t: (key: string, opts?: Record<string, unknown>) => string
  counteringId: string | null
  counterPrice: string
  onCounterPriceChange: (v: string) => void
  onStartCounter: (id: string, price: number) => void
  onCancelCounter: () => void
  onAccept: () => void
  onReject: () => void
  onSubmitCounter: () => void
  isActing: boolean
}) {
  const cropName = isTamil ? request.listing.crop.nameTamil : request.listing.crop.name
  const canRespond = request.status === 'PENDING' || request.status === 'COUNTERED'
  const buyerLabel = request.buyer.organization ?? request.buyer.name
  const totalValue = request.quantity * request.offeredPrice
  const needsAction = canRespond && !request.order

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-card-hover',
        needsAction ? 'border-accent/40 shadow-sm' : 'border-border/80'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 bg-muted/15 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl">{getCropEmoji(request.listing.crop.name)}</span>
            <h3 className={cn('font-tamil text-lg font-bold', textClass)}>{cropName}</h3>
            <Badge variant={statusVariant[request.status]}>
              {t(`requests.status.${request.status}`)}
            </Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {buyerLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {request.buyer.district}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {formatDate(request.createdAt, locale)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t('requests.totalValue')}</p>
          <p className="text-xl font-bold text-primary tabular-nums">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
        <StatItem
          icon={Package}
          label={t('requests.quantity')}
          value={`${request.quantity} ${request.listing.unit}`}
        />
        <StatItem
          icon={IndianRupee}
          label={t('requests.offeredPrice')}
          value={`${formatCurrency(request.offeredPrice)}/${request.listing.unit}`}
          highlight
        />
        <StatItem
          icon={IndianRupee}
          label={t('requests.listingPrice')}
          value={`${formatCurrency(request.listing.expectedPrice)}/${request.listing.unit}`}
        />
        <StatItem
          icon={request.deliveryType === 'DELIVERY' ? Truck : MapPin}
          label={t('requests.deliveryType')}
          value={
            request.deliveryType === 'DELIVERY' ? t('requests.delivery') : t('requests.pickup')
          }
        />
      </div>

      {request.message && (
        <div className="mx-4 mb-4 flex gap-2 rounded-xl bg-muted/40 px-3.5 py-3 text-sm sm:mx-5">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="leading-relaxed">{request.message}</p>
        </div>
      )}

      {request.order && (
        <p className="mx-4 mb-4 text-sm text-success sm:mx-5">
          {t('requests.orderCreated')}: {request.order.id.slice(-8).toUpperCase()}
        </p>
      )}

      {needsAction && (
        <div className="border-t border-border/50 bg-muted/10 px-4 py-3.5 sm:px-5">
          {counteringId === request.id ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="number"
                className="h-10 w-36"
                value={counterPrice}
                onChange={(e) => onCounterPriceChange(e.target.value)}
                placeholder={t('requests.counterPrice')}
              />
              <Button size="sm" onClick={onSubmitCounter} disabled={isActing}>
                {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : t('requests.submitCounter')}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelCounter}>
                {t('listings.cancel')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={onAccept} disabled={isActing}>
                <Check className="h-4 w-4" />
                {t('common.accept')}
              </Button>
              <Button size="sm" variant="destructive" onClick={onReject} disabled={isActing}>
                <X className="h-4 w-4" />
                {t('common.reject')}
              </Button>
              {request.status === 'PENDING' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartCounter(request.id, request.offeredPrice)}
                  disabled={isActing}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('common.counterOffer')}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3.5 py-3',
        highlight ? 'border-secondary/30 bg-secondary/5' : 'border-border/60 bg-muted/20'
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </div>
      <p className={cn('text-sm font-bold tabular-nums', highlight && 'text-secondary')}>{value}</p>
    </div>
  )
}
