import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Sprout, Inbox, Package, IndianRupee, ArrowRight, Download } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function KpiCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: 'primary' | 'secondary' | 'accent'
}) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  }
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function FarmerDashboardPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isTamil = i18n.language?.startsWith('ta')

  const { data, isLoading, error } = useQuery({
    queryKey: ['farmer-dashboard'],
    queryFn: dashboardApi.getFarmerDashboard,
  })

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  const cropChartData =
    data?.salesByCrop.map((item) => ({
      name: isTamil ? item.cropNameTamil : item.cropName,
      revenue: item.revenue,
    })) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">
            {t('dashboard.farmerWelcome', { name: user?.name ?? '' })}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('dashboard.farmerSubtitle')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/farmer/sales">
            <Download className="mr-2 h-4 w-4" />
            {t('dashboard.viewSales')}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label={t('dashboard.activeListings')}
              value={data.kpis.activeListings}
              icon={Sprout}
              accent="secondary"
            />
            <KpiCard
              label={t('dashboard.pendingRequests')}
              value={data.kpis.pendingRequests}
              icon={Inbox}
              accent="accent"
            />
            <KpiCard
              label={t('dashboard.activeOrders')}
              value={data.kpis.activeOrders}
              icon={Package}
            />
            <KpiCard
              label={t('dashboard.totalRevenue')}
              value={formatCurrency(data.kpis.totalRevenue)}
              icon={IndianRupee}
              accent="secondary"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.monthlySales')}</CardTitle>
                <CardDescription>{t('dashboard.monthlySalesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {data.monthlySales.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {t('dashboard.noSalesYet')}
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#3F8F5F" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.salesByCrop')}</CardTitle>
                <CardDescription>{t('dashboard.salesByCropDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {cropChartData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {t('dashboard.noSalesYet')}
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={cropChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#164A35" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.recentSales')}</CardTitle>
                <CardDescription>
                  {t('dashboard.salesSummary', {
                    count: data.kpis.totalSalesCount,
                    qty: data.kpis.totalQuantitySold,
                  })}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/farmer/sales">
                  {t('dashboard.viewAll')}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentSales.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t('dashboard.noSalesYet')}
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {data.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCropEmoji(sale.crop.name)}</span>
                        <div>
                          <p className="font-medium">
                            {isTamil ? sale.crop.nameTamil : sale.crop.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sale.buyerName} · {sale.quantity} {sale.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatCurrency(sale.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.soldAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" asChild>
              <Link to="/farmer/listings">{t('nav.myProduce')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/farmer/requests">{t('nav.purchaseRequests')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/farmer/orders">{t('nav.orders')}</Link>
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
