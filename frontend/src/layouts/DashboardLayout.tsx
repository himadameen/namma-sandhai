import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Inbox,
  Package,
  User,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

const farmerNavItems = [
  { href: '/farmer/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/farmer/listings', labelKey: 'nav.myProduce', icon: Sprout },
  { href: '/farmer/market-prices', labelKey: 'nav.marketPrices', icon: TrendingUp },
  { href: '/farmer/requests', labelKey: 'nav.purchaseRequests', icon: Inbox },
  { href: '/farmer/orders', labelKey: 'nav.orders', icon: Package },
  { href: '/farmer/profile', labelKey: 'nav.profile', icon: User },
]

const buyerNavItems = [
  { href: '/buyer/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/marketplace', labelKey: 'nav.marketplace', icon: Store },
  { href: '/buyer/requests', labelKey: 'nav.purchaseRequests', icon: Inbox },
  { href: '/buyer/orders', labelKey: 'nav.orders', icon: Package },
  { href: '/buyer/profile', labelKey: 'nav.profile', icon: User },
]

function BottomNav({ items }: { items: typeof farmerNavItems }) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = location.pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-tamil">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function FarmerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
      <BottomNav items={farmerNavItems} />
    </div>
  )
}

export function BuyerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
      <BottomNav items={buyerNavItems} />
    </div>
  )
}

export function AdminLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader title={`${t('brand.nameTamil')} — ${t('nav.admin')}`} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
