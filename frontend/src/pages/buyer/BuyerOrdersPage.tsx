import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
} from 'lucide-react'
import { ordersApi, type OrderStatus, type OrderStatusUpdate, type DeliveryType } from '@/api/orders'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { OrderCard } from '@/components/orders/OrderCard'
import { useLocaleText } from '@/hooks/useLocaleText'
import { marketApi } from '@/api/market'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { PaginationControls } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

type StatusFilter = '' | OrderStatus
type DeliveryFilter = '' | DeliveryType

export function BuyerOrdersPage() {
  const { t, isTamil, textClass } = useLocaleText()
  const queryClient = useQueryClient()
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
    queryKey: ['buyer-orders', queryParams],
    queryFn: () => ordersApi.getBuyerOrders(queryParams),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatusUpdate }) =>
      ordersApi.updateBuyerOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buyer-orders'] }),
  })

  const orders = data?.orders ?? []
  const pagination = data?.pagination
  const summary = data?.summary
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  const cropOptions = useMemo(
    () => [
      { value: '', label: t('orders.allCrops') },
      ...(crops?.map((crop) => ({
        value: crop.id,
        label: isTamil ? crop.nameTamil : crop.name,
      })) ?? []),
    ],
    [crops, isTamil, t]
  )

  const deliveryOptions = useMemo(
    () => [
      { value: '', label: t('orders.allDelivery') },
      { value: 'PICKUP', label: t('requests.pickup') },
      { value: 'DELIVERY', label: t('requests.delivery') },
    ],
    [t]
  )

  const statusTabs: { key: StatusFilter; label: string; count?: number }[] = [
    { key: '', label: t('orders.allStatuses'), count: summary?.total },
    { key: 'PENDING_CONFIRMATION', label: t('orders.status.PENDING_CONFIRMATION'), count: summary?.pendingConfirmation },
    { key: 'CONFIRMED', label: t('orders.status.CONFIRMED'), count: summary?.confirmed },
    { key: 'IN_TRANSIT', label: t('orders.status.IN_TRANSIT'), count: summary?.inTransit },
    { key: 'COMPLETED', label: t('orders.status.COMPLETED'), count: summary?.completed },
    { key: 'CANCELLED', label: t('orders.status.CANCELLED'), count: summary?.cancelled },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.orders')} description={t('orders.buyerSubtitle')} />

      {summary && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { label: t('orders.totalOrders'), value: summary.total, icon: Package, tone: 'primary' as const },
            { label: t('orders.activeOrders'), value: summary.active, icon: Clock, tone: 'accent' as const },
            { label: t('orders.status.IN_TRANSIT'), value: summary.inTransit, icon: Truck, tone: 'secondary' as const },
            { label: t('orders.status.COMPLETED'), value: summary.completed, icon: CheckCircle2, tone: 'muted' as const },
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
              placeholder={t('orders.buyerSearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isFetching && debouncedSearch && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-medium leading-none">{t('orders.filterCrop')}</label>
              <DropdownSelect
                value={cropFilter}
                options={cropOptions}
                onChange={(value) => {
                  setCropFilter(value)
                  setPage(1)
                }}
                ariaLabel={t('orders.filterCrop')}
                fullWidth
                align="left"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-medium leading-none">{t('orders.filterDelivery')}</label>
              <DropdownSelect
                value={deliveryFilter}
                options={deliveryOptions}
                onChange={(value) => {
                  setDeliveryFilter(value as DeliveryFilter)
                  setPage(1)
                }}
                ariaLabel={t('orders.filterDelivery')}
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
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className={cn('text-sm text-muted-foreground', textClass)}>
                {debouncedSearch || statusFilter || cropFilter || deliveryFilter
                  ? t('orders.noMatching')
                  : t('orders.noOrders')}
              </p>
            </div>
          ) : (
            <>
              {summary && summary.active > 0 && !statusFilter && (
                <p className="text-sm font-medium text-accent">
                  {t('orders.activeCount', { count: summary.active })}
                </p>
              )}

              <div className={cn('space-y-3', isFetching && 'opacity-70')}>
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    role="BUYER"
                    isUpdating={updateMutation.isPending && updateMutation.variables?.id === order.id}
                    onUpdateStatus={(id, status) => updateMutation.mutate({ id, status })}
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
                  onLimitChange={(nextLimit) => {
                    setLimit(nextLimit)
                    setPage(1)
                  }}
                  limitOptions={PAGE_SIZE_OPTIONS}
                  labels={{
                    pageSize: t('listings.pageSize'),
                    showing: t('orders.showingRange', { from, to, total: pagination.total }),
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
