import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  MapPin,
  Phone,
  Mail,
  Package,
  ShoppingCart,
  Users,
  Tractor,
  Building2,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'
import { adminApi, type AdminBuyer, type AdminFarmer } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { TN_DISTRICTS } from '@/constants/districts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { PaginationControls } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { AdminFilterBar, AdminFilterSearch, EmptyState, AdminQueryError } from './shared'
import { selectString, usePaginationLabels } from './helpers'
import { localizedName } from '@/utils/localizedName'
import { cn } from '@/lib/utils'

type UserKind = 'farmers' | 'buyers'
type AdminUserRow = AdminFarmer | AdminBuyer

function UserAvatar({ name, kind }: { name: string; kind: UserKind }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const Icon = kind === 'farmers' ? Tractor : Building2
  return (
    <div className="relative shrink-0">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary ring-1 ring-primary/15">
        {initial}
      </div>
      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-muted text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
      </span>
    </div>
  )
}

function UserStat({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function AdminUserCard({
  user,
  kind,
  isTamil,
  t,
  onVerify,
  onToggleActive,
  verifyPending,
  statusPending,
}: {
  user: AdminUserRow
  kind: UserKind
  isTamil: boolean
  t: (key: string) => string
  onVerify: () => void
  onToggleActive: () => void
  verifyPending: boolean
  statusPending: boolean
}) {
  const isFarmer = kind === 'farmers'
  const farmer = isFarmer ? (user as AdminFarmer) : null
  const buyer = !isFarmer ? (user as AdminBuyer) : null
  const displayName = isFarmer
    ? localizedName(farmer!, isTamil)
    : (buyer!.organization ?? buyer!.name)

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md',
        !user.isActive && 'opacity-80',
        user.isVerified ? 'border-border/80' : 'border-accent/30'
      )}
    >
      <div className="h-0.5 bg-gradient-to-r from-primary/60 via-secondary/40 to-transparent" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex gap-3.5">
          <UserAvatar name={displayName} kind={kind} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className={cn('truncate font-semibold leading-tight', isTamil && isFarmer && 'font-tamil')}>
                {displayName}
              </h3>
              <Badge variant={user.isActive ? 'success' : 'destructive'} className="shrink-0 text-[10px]">
                {user.isActive ? t('admin.active') : t('admin.inactive')}
              </Badge>
            </div>
            {!isFarmer && buyer?.name && buyer.organization ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{buyer.name}</p>
            ) : null}
            <div className="mt-2 space-y-1">
              <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                {user.email}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" />
                {user.phone}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                {user.district}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant={user.isVerified ? 'success' : 'muted'} className="gap-1 text-[10px]">
            {user.isVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
            {user.isVerified ? t('common.verified') : t('admin.unverified')}
          </Badge>
          <Badge
            variant={user.kycStatus === 'VERIFIED' ? 'success' : user.kycStatus === 'REJECTED' ? 'destructive' : 'muted'}
            className="text-[10px]"
          >
            {t(`admin.kyc.${user.kycStatus}`)}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {isFarmer ? (
            <>
              <UserStat icon={Package} label={t('admin.listings')} value={farmer!.listingsCount} />
              <UserStat icon={ShoppingCart} label={t('nav.orders')} value={farmer!.ordersCount} />
            </>
          ) : (
            <>
              <UserStat icon={ShoppingCart} label={t('nav.orders')} value={buyer!.ordersCount} />
              <UserStat icon={Users} label={t('admin.requests')} value={buyer!.requestsCount} />
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Button
            size="sm"
            variant={user.isVerified ? 'outline' : 'default'}
            className="flex-1 sm:flex-none"
            disabled={verifyPending}
            onClick={onVerify}
          >
            {verifyPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : user.isVerified ? (
              t('admin.revokeVerify')
            ) : (
              t('admin.verify')
            )}
          </Button>
          <Button
            size="sm"
            variant={user.isActive ? 'outline' : 'destructive'}
            className="flex-1 sm:flex-none"
            disabled={statusPending}
            onClick={onToggleActive}
          >
            {user.isActive ? t('admin.deactivate') : t('admin.activate')}
          </Button>
        </div>
      </div>
    </article>
  )
}

export function AdminUsers() {
  const { t, isTamil } = useLocaleText()
  const queryClient = useQueryClient()
  const [kind, setKind] = useState<UserKind>('farmers')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const [verified, setVerified] = useState('')
  const [active, setActive] = useState('')

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
      verified: verified || undefined,
      active: active || undefined,
    }),
    [page, limit, search, district, verified, active]
  )

  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
  })

  const { data: farmersData, isLoading: farmersLoading, isError: farmersError, error: farmersQueryError, refetch: refetchFarmers } = useQuery({
    queryKey: ['admin-farmers', params],
    queryFn: () => adminApi.getFarmers(params),
    enabled: kind === 'farmers',
  })

  const { data: buyersData, isLoading: buyersLoading, isError: buyersError, error: buyersQueryError, refetch: refetchBuyers } = useQuery({
    queryKey: ['admin-buyers', params],
    queryFn: () => adminApi.getBuyers(params),
    enabled: kind === 'buyers',
  })

  const data = kind === 'farmers' ? farmersData : buyersData
  const isLoading = kind === 'farmers' ? farmersLoading : buyersLoading
  const isError = kind === 'farmers' ? farmersError : buyersError
  const queryError = kind === 'farmers' ? farmersQueryError : buyersQueryError
  const refetchUsers = kind === 'farmers' ? refetchFarmers : refetchBuyers

  const verifyFarmer = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) => adminApi.verifyFarmer(id, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-farmers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-buyers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })
  const verifyBuyer = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) => adminApi.verifyBuyer(id, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-farmers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-buyers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })
  const setStatus = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => adminApi.setUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-farmers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-buyers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })

  const pagination = data?.pagination
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0
  const paginationLabels = usePaginationLabels(from, to, pagination?.total ?? 0, pagination?.page ?? 1, pagination?.totalPages ?? 1)

  const farmerTotal = dashboard?.kpis.farmers ?? farmersData?.pagination.total
  const buyerTotal = dashboard?.kpis.buyers ?? buyersData?.pagination.total

  const hasFilters = Boolean(search || district || verified || active)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-border/80 bg-muted/30 p-1">
          {(['farmers', 'buyers'] as const).map((tab) => {
            const count = tab === 'farmers' ? farmerTotal : buyerTotal
            const activeTab = kind === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setKind(tab)
                  setPage(1)
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  activeTab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'farmers' ? <Tractor className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                {t(tab === 'farmers' ? 'admin.farmers' : 'admin.buyers')}
                {count != null ? (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                      activeTab ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        {pagination ? (
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? t('admin.usersFiltered', { count: pagination.total })
              : t('admin.usersShowing', { from, to, total: pagination.total })}
          </p>
        ) : null}
      </div>

      <AdminFilterBar>
        <AdminFilterSearch
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.searchUsers')}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('profile.district')}
          value={district}
          onChange={selectString(setDistrict)}
          options={[{ value: '', label: t('admin.allDistricts') }, ...TN_DISTRICTS.map((d) => ({ value: d, label: d }))]}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('common.verified')}
          value={verified}
          onChange={selectString(setVerified)}
          options={[{ value: '', label: t('admin.all') }, { value: 'true', label: t('common.verified') }, { value: 'false', label: t('admin.unverified') }]}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('admin.accountStatus')}
          value={active}
          onChange={selectString(setActive)}
          options={[{ value: '', label: t('admin.all') }, { value: 'true', label: t('admin.active') }, { value: 'false', label: t('admin.inactive') }]}
        />
      </AdminFilterBar>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl border border-border/60" />
          ))}
        </div>
      ) : isError ? (
        <AdminQueryError
          message={queryError instanceof Error ? queryError.message : t('admin.loadFailed')}
          onRetry={() => refetchUsers()}
          retryLabel={t('common.retry')}
        />
      ) : !data?.items.length ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState message={t('admin.noUsersFound')} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((user: AdminUserRow) => {
            const isFarmer = kind === 'farmers'
            const verifyMutation = isFarmer ? verifyFarmer : verifyBuyer
            return (
              <AdminUserCard
                key={user.id}
                user={user}
                kind={kind}
                isTamil={isTamil}
                t={t}
                verifyPending={verifyMutation.isPending}
                statusPending={setStatus.isPending}
                onVerify={() => verifyMutation.mutate({ id: user.id, isVerified: !user.isVerified })}
                onToggleActive={() => setStatus.mutate({ userId: user.userId, isActive: !user.isActive })}
              />
            )
          })}
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
