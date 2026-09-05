import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Truck,
  Package,
  MapPin,
  IndianRupee,
  CalendarDays,
  MessageSquare,
  Store,
  ArrowRight,
  User,
  ExternalLink,
} from 'lucide-react'
import { purchaseRequestsApi, type PurchaseRequest, type PurchaseRequestStatus, type DeliveryType } from '@/api/purchaseRequests'
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

function buildSummary(requests: PurchaseRequest[]) {
  const pending = requests.filter((r) => r.status === 'PENDING').length
  const accepted = requests.filter((r) => r.status === 'ACCEPTED').length
  const rejected = requests.filter((r) => r.status === 'REJECTED').length
  const countered = requests.filter((r) => r.status === 'COUNTERED').length

  return {
    total: requests.length,
    pending,
    accepted,
    rejected,
    countered,
    awaitingResponse: pending,
    counterOffers: countered,
  }
}

function filterRequests(
  requests: PurchaseRequest[],
  {
    statusFilter,
    cropFilter,
    deliveryFilter,
    search,
    isTamil,
  }: {
    statusFilter: StatusFilter
    cropFilter: string
    deliveryFilter: DeliveryFilter
    search: string
    isTamil: boolean
  }
) {
  const term = search.toLowerCase()

  return requests.filter((request) => {
    if (statusFilter && request.status !== statusFilter) return false
    if (cropFilter && request.listing.crop.id !== cropFilter) return false
    if (deliveryFilter && request.deliveryType !== deliveryFilter) return false

    if (term) {
      const cropName = isTamil ? request.listing.crop.nameTamil : request.listing.crop.name
      const haystack = [
        request.listing.farmer.name,
        cropName,
        request.listing.crop.name,
        request.listing.crop.nameTamil,
        request.listing.district,
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(term)) return false
    }

    return true
  })
}

export function BuyerRequestsPage() {
  const { t, isTamil, textClass, locale } = useLocaleText()
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

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['buyer-requests'],
    queryFn: purchaseRequestsApi.getBuyerRequests,
  })

  const { data: crops } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  const summary = useMemo(() => buildSummary(requests), [requests])

  const filteredRequests = useMemo(
    () =>
      filterRequests(requests, {
        statusFilter,
        cropFilter,
        deliveryFilter,
        search: debouncedSearch,
        isTamil,
      }),
    [requests, statusFilter, cropFilter, deliveryFilter, debouncedSearch, isTamil]
  )

  const total = filteredRequests.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(page, totalPages)
  const paginatedRequests = filteredRequests.slice((safePage - 1) * limit, safePage * limit)
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1
  const to = Math.min(safePage * limit, total)

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
    { key: '', label: t('requests.allStatuses'), count: summary.total },
    { key: 'PENDING', label: t('requests.status.PENDING'), count: summary.pending },
    { key: 'COUNTERED', label: t('requests.status.COUNTERED'), count: summary.countered },
    { key: 'ACCEPTED', label: t('requests.status.ACCEPTED'), count: summary.accepted },
    { key: 'REJECTED', label: t('requests.status.REJECTED'), count: summary.rejected },
  ]


  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.purchaseRequests')}
        description={t('requests.buyerSubtitle')}
        actions={
          <Button variant="outline" asChild>
            <Link to="/buyer/marketplace">
              <Store className="mr-2 h-4 w-4" />
              {t('dashboard.browseMarketplace')}
            </Link>
          </Button>
        }
      />

      {requests.length > 0 && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: t('requests.totalRequests'),
              value: summary.total,
              icon: Inbox,
              tone: 'primary' as const,
            },
            {
              label: t('requests.awaitingResponse'),
              value: summary.awaitingResponse,
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
              label: t('requests.counterOffers'),
              value: summary.counterOffers,
              icon: RefreshCw,
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
              placeholder={t('requests.buyerSearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
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
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className={cn('text-sm text-muted-foreground', textClass)}>{t('requests.noOutgoing')}</p>
              <Button className="mt-4" asChild>
                <Link to="/buyer/marketplace">
                  <Store className="mr-2 h-4 w-4" />
                  {t('dashboard.browseMarketplace')}
                </Link>
              </Button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className={cn('text-sm text-muted-foreground', textClass)}>{t('requests.noMatching')}</p>
            </div>
          ) : (
            <>
              {summary.counterOffers > 0 && !statusFilter && (
                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
                  <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className={cn('text-sm font-medium text-foreground', textClass)}>
                    {t('requests.counterOfferReceived')} — {summary.counterOffers}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {paginatedRequests.map((request) => (
                  <BuyerRequestCard
                    key={request.id}
                    request={request}
                    isTamil={isTamil}
                    locale={locale}
                    textClass={textClass}
                    t={t}
                  />
                ))}
              </div>

              {total > limit && (
                <PaginationControls
                  page={safePage}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(nextLimit) => {
                    setLimit(nextLimit)
                    setPage(1)
                  }}
                  limitOptions={PAGE_SIZE_OPTIONS}
                  labels={{
                    pageSize: t('listings.pageSize'),
                    showing: t('listings.showingRange', { from, to, total }),
                    previous: t('listings.previousPage'),
                    next: t('listings.nextPage'),
                    pageOf: t('listings.pageOf', { page: safePage, totalPages }),
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

function BuyerRequestCard({
  request,
  isTamil,
  locale,
  textClass,
  t,
}: {
  request: PurchaseRequest
  isTamil: boolean
  locale: string
  textClass: string
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  const cropName = isTamil ? request.listing.crop.nameTamil : request.listing.crop.name
  const totalValue = request.quantity * request.offeredPrice
  const priceDiff = request.offeredPrice - request.listing.expectedPrice
  const isPending = request.status === 'PENDING'
  const isCountered = request.status === 'COUNTERED'
  const isAccepted = request.status === 'ACCEPTED'
  const isRejected = request.status === 'REJECTED'
  const needsAttention = isCountered

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-card-hover',
        needsAttention ? 'border-primary/35 shadow-sm' : 'border-border/80',
        isAccepted && 'border-success/30',
        isRejected && 'opacity-90'
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
              <User className="h-3.5 w-3.5 shrink-0" />
              {request.listing.farmer.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {request.listing.district}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {formatDate(request.createdAt, locale)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t('requests.totalValue')}</p>
          <p className="text-xl font-bold tabular-nums text-primary">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {isCountered && (
        <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-3.5 py-3 sm:mx-5">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className={cn('text-sm font-semibold text-foreground', textClass)}>{t('requests.counterOfferReceived')}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatCurrency(request.offeredPrice)}/{request.listing.unit}
            </p>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/[0.08] px-3.5 py-2.5 text-sm sm:mx-5">
          <Clock className="h-4 w-4 shrink-0 text-accent-foreground" />
          <span className={cn('font-medium text-accent-foreground', textClass)}>{t('requests.awaitingResponse')}</span>
        </div>
      )}

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
          highlight={isCountered}
        />
        <StatItem
          icon={IndianRupee}
          label={t('requests.listingPriceLabel')}
          value={`${formatCurrency(request.listing.expectedPrice)}/${request.listing.unit}`}
        />
        <StatItem
          icon={request.deliveryType === 'DELIVERY' ? Truck : MapPin}
          label={t('requests.deliveryType')}
          value={request.deliveryType === 'DELIVERY' ? t('requests.delivery') : t('requests.pickup')}
        />
      </div>

      {priceDiff !== 0 && !isRejected && (
        <p
          className={cn(
            'mx-4 mb-1 text-xs font-medium sm:mx-5',
            priceDiff > 0 ? 'text-secondary' : 'text-accent-foreground'
          )}
        >
          {priceDiff > 0
            ? t('requests.priceAboveListing', { amount: formatCurrency(Math.abs(priceDiff)) })
            : t('requests.priceBelowListing', { amount: formatCurrency(Math.abs(priceDiff)) })}
        </p>
      )}

      {request.message && (
        <div className="mx-4 mb-4 flex gap-2 rounded-xl bg-muted/40 px-3.5 py-3 text-sm sm:mx-5">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="leading-relaxed">{request.message}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 bg-muted/10 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/buyer/marketplace/${request.listingId}`}>
              <ExternalLink className="h-4 w-4" />
              {t('requests.viewListing')}
            </Link>
          </Button>
          {request.order && (
            <Button size="sm" asChild>
              <Link to="/buyer/orders">
                {t('requests.orderCreated')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {isRejected && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <XCircle className="h-3.5 w-3.5" />
            {t('requests.status.REJECTED')}
          </span>
        )}
      </div>
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
        highlight ? 'border-primary/30 bg-primary/[0.06]' : 'border-border/60 bg-muted/20'
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </div>
      <p className={cn('text-sm font-bold tabular-nums', highlight && 'text-primary')}>{value}</p>
    </div>
  )
}
