import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Sprout,
  ShoppingBag,
  Package,
  IndianRupee,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { adminApi } from '@/api/admin'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type AdminTab = 'overview' | 'farmers' | 'buyers'

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminPanelPage() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<AdminTab>('overview')

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
  })

  const { data: farmers, isLoading: farmersLoading } = useQuery({
    queryKey: ['admin-farmers'],
    queryFn: adminApi.getFarmers,
    enabled: tab === 'farmers' || tab === 'overview',
  })

  const { data: buyers, isLoading: buyersLoading } = useQuery({
    queryKey: ['admin-buyers'],
    queryFn: adminApi.getBuyers,
    enabled: tab === 'buyers' || tab === 'overview',
  })

  const verifyFarmerMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      adminApi.verifyFarmer(id, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-farmers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })

  const verifyBuyerMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      adminApi.verifyBuyer(id, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-buyers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: t('admin.overview') },
    { id: 'farmers', label: t('admin.farmers') },
    { id: 'buyers', label: t('admin.buyers') },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">
          {t('admin.title')}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('admin.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {dashLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : dashboard ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard label={t('admin.totalUsers')} value={dashboard.kpis.totalUsers} icon={Users} />
                <KpiCard label={t('admin.farmers')} value={dashboard.kpis.farmers} icon={Sprout} />
                <KpiCard label={t('admin.buyers')} value={dashboard.kpis.buyers} icon={ShoppingBag} />
                <KpiCard
                  label={t('admin.activeListings')}
                  value={dashboard.kpis.activeListings}
                  icon={Package}
                />
                <KpiCard
                  label={t('admin.completedOrders')}
                  value={dashboard.kpis.completedOrders}
                  icon={Package}
                />
                <KpiCard
                  label={t('admin.salesVolume')}
                  value={formatCurrency(dashboard.kpis.totalSalesVolume)}
                  icon={IndianRupee}
                />
                <KpiCard
                  label={t('admin.pendingVerifications')}
                  value={dashboard.kpis.pendingVerifications}
                  icon={ShieldCheck}
                />
                <KpiCard
                  label={t('admin.verifiedUsers')}
                  value={dashboard.kpis.verifiedFarmers + dashboard.kpis.verifiedBuyers}
                  icon={ShieldCheck}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.recentOrders')}</CardTitle>
                  <CardDescription>{t('admin.recentOrdersDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.recentOrders.length === 0 ? (
                    <p className="py-6 text-center text-muted-foreground">{t('orders.noOrders')}</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {dashboard.recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {isTamil ? order.crop.nameTamil : order.crop.name}
                            </p>
                            <p className="text-muted-foreground">
                              {order.farmerName} → {order.buyerName}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="muted">
                              {t(`orders.status.${order.status}`)}
                            </Badge>
                            <span className="font-semibold text-primary">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </>
      )}

      {tab === 'farmers' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.manageFarmers')}</CardTitle>
            <CardDescription>{t('admin.manageFarmersDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {farmersLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">{t('profile.name')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('profile.district')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('admin.listings')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('nav.orders')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('common.verified')}</th>
                    <th className="pb-3 font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers?.map((farmer) => (
                    <tr key={farmer.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{farmer.name}</p>
                        <p className="text-xs text-muted-foreground">{farmer.email}</p>
                      </td>
                      <td className="py-3 pr-4">{farmer.district}</td>
                      <td className="py-3 pr-4">{farmer.listingsCount}</td>
                      <td className="py-3 pr-4">{farmer.ordersCount}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={farmer.isVerified ? 'success' : 'muted'}>
                          {farmer.isVerified ? t('common.verified') : t('admin.unverified')}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant={farmer.isVerified ? 'outline' : 'default'}
                          disabled={verifyFarmerMutation.isPending}
                          onClick={() =>
                            verifyFarmerMutation.mutate({
                              id: farmer.id,
                              isVerified: !farmer.isVerified,
                            })
                          }
                        >
                          {verifyFarmerMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : farmer.isVerified ? (
                            t('admin.revokeVerify')
                          ) : (
                            t('admin.verify')
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'buyers' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.manageBuyers')}</CardTitle>
            <CardDescription>{t('admin.manageBuyersDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {buyersLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">{t('profile.organization')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('profile.district')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('profile.buyerType')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('nav.orders')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('common.verified')}</th>
                    <th className="pb-3 font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers?.map((buyer) => (
                    <tr key={buyer.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{buyer.organization ?? buyer.name}</p>
                        <p className="text-xs text-muted-foreground">{buyer.email}</p>
                      </td>
                      <td className="py-3 pr-4">{buyer.district}</td>
                      <td className="py-3 pr-4">
                        {t(`buyerTypes.${buyer.buyerType}`)}
                      </td>
                      <td className="py-3 pr-4">{buyer.ordersCount}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={buyer.isVerified ? 'success' : 'muted'}>
                          {buyer.isVerified ? t('common.verified') : t('admin.unverified')}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant={buyer.isVerified ? 'outline' : 'default'}
                          disabled={verifyBuyerMutation.isPending}
                          onClick={() =>
                            verifyBuyerMutation.mutate({
                              id: buyer.id,
                              isVerified: !buyer.isVerified,
                            })
                          }
                        >
                          {verifyBuyerMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : buyer.isVerified ? (
                            t('admin.revokeVerify')
                          ) : (
                            t('admin.verify')
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
