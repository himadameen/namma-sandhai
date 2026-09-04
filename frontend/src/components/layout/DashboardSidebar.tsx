import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Inbox,
  Package,
  Receipt,
  User,
  Store,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { LogoMark } from '@/components/brand/LogoMark'
import { Logo } from '@/components/brand/Logo'
import { useDashboardShell } from '@/store/dashboardShell'
import { useAuth } from '@/store/auth'
import { useLocaleText } from '@/hooks/useLocaleText'
import { cn } from '@/lib/utils'

export interface DashboardNavItem {
  href: string
  labelKey: string
  icon: LucideIcon
}

export const farmerNavItems: DashboardNavItem[] = [
  { href: '/farmer/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/farmer/listings', labelKey: 'nav.myProduce', icon: Sprout },
  { href: '/farmer/market-prices', labelKey: 'nav.marketPrices', icon: TrendingUp },
  { href: '/farmer/requests', labelKey: 'nav.purchaseRequests', icon: Inbox },
  { href: '/farmer/orders', labelKey: 'nav.orders', icon: Package },
  { href: '/farmer/sales', labelKey: 'nav.salesRecords', icon: Receipt },
  { href: '/farmer/profile', labelKey: 'nav.profile', icon: User },
]

export const buyerNavItems: DashboardNavItem[] = [
  { href: '/buyer/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/marketplace', labelKey: 'nav.marketplace', icon: Store },
  { href: '/buyer/requests', labelKey: 'nav.purchaseRequests', icon: Inbox },
  { href: '/buyer/orders', labelKey: 'nav.orders', icon: Package },
  { href: '/buyer/profile', labelKey: 'nav.profile', icon: User },
]

export const adminNavItems: DashboardNavItem[] = [
  { href: '/admin', labelKey: 'nav.admin', icon: ShieldCheck },
]

interface DashboardSidebarProps {
  items: DashboardNavItem[]
  homeHref: string
}

export function DashboardSidebar({ items, homeHref }: DashboardSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { collapsed, toggleCollapsed } = useDashboardShell()
  const { t, isTamil, textClass } = useLocaleText()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside
      className={cn(
        'relative hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-out md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex',
        collapsed ? 'md:w-[4.5rem]' : 'md:w-64'
      )}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="cta-interactive absolute top-1/2 right-0 z-50 hidden h-7 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground md:flex"
        aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
      <div className="flex h-16 shrink-0 items-center border-b border-border px-3">
        <Link
          to={homeHref}
          className={cn(
            'flex min-w-0 flex-1 items-center transition-opacity hover:opacity-90',
            collapsed ? 'justify-center' : 'gap-2.5 px-1'
          )}
          title={t('nav.dashboard')}
        >
          {collapsed ? (
            <LogoMark size="sm" />
          ) : (
            <Logo size="sm" tamilMode={isTamil} hideMark={false} />
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {items.map((item) => {
          const Icon = item.icon
          const active =
            item.href === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? t(item.labelKey) : undefined}
              className={cn(
                'cta-interactive group flex items-center rounded-xl py-2.5 text-sm font-semibold transition-colors',
                collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
              {!collapsed && <span className={cn('truncate', textClass)}>{t(item.labelKey)}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-2">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'cta-interactive flex w-full items-center rounded-xl py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10',
            collapsed ? 'justify-center px-2' : 'gap-3 px-3'
          )}
          title={collapsed ? t('nav.logout') : undefined}
        >
          <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" />
          {!collapsed && <span className={textClass}>{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}

interface MobileBottomNavProps {
  items: DashboardNavItem[]
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const location = useLocation()
  const { t, textClass } = useLocaleText()

  const mobileItems = items.slice(0, 5)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-stretch justify-around py-1.5">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const active = location.pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'cta-interactive flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn('max-w-[4.5rem] truncate', textClass)}>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
