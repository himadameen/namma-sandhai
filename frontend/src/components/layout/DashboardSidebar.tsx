import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Inbox,
  Package,
  Receipt,
  User,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  FileCheck,
  MessageSquare,
  BarChart3,
  Warehouse,
  Download,
  Shield,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { LogoMark } from '@/components/brand/LogoMark'
import { Logo } from '@/components/brand/Logo'
import { resetScrollPosition } from '@/components/layout/ScrollToTop'
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
  { href: '/buyer/marketplace', labelKey: 'nav.marketplace', icon: Store },
  { href: '/buyer/requests', labelKey: 'nav.purchaseRequests', icon: Inbox },
  { href: '/buyer/orders', labelKey: 'nav.orders', icon: Package },
  { href: '/buyer/profile', labelKey: 'nav.profile', icon: User },
]

export const adminNavItems: DashboardNavItem[] = [
  { href: '/admin', labelKey: 'admin.overview', icon: LayoutDashboard },
  { href: '/admin/users', labelKey: 'admin.users', icon: Users },
  { href: '/admin/kyc', labelKey: 'admin.kycReview', icon: FileCheck },
  { href: '/admin/listings', labelKey: 'admin.productListings', icon: Package },
  { href: '/admin/transactions', labelKey: 'admin.transactions', icon: Receipt },
  { href: '/admin/enquiries', labelKey: 'admin.enquiries', icon: MessageSquare },
  { href: '/admin/analytics', labelKey: 'admin.analytics', icon: BarChart3 },
  { href: '/admin/stock', labelKey: 'admin.stockChanges', icon: Warehouse },
  { href: '/admin/reports', labelKey: 'admin.reports', icon: Download },
  { href: '/admin/roles', labelKey: 'admin.roles', icon: Shield },
  { href: '/admin/profile', labelKey: 'nav.profile', icon: User },
]

function isNavItemActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === '/admin' || pathname === '/admin/'
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

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
          const active = isNavItemActive(location.pathname, item.href)

          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? t(item.labelKey) : undefined}
              onClick={resetScrollPosition}
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
  profilePath: string
}

const MOBILE_PRIMARY_SLOTS = 4

function buildMobileNavSlots(items: DashboardNavItem[], profilePath: string) {
  const profileItem: DashboardNavItem =
    items.find((item) => item.href === profilePath) ?? {
      href: profilePath,
      labelKey: 'nav.profile',
      icon: User,
    }

  const withoutProfile = items.filter((item) => item.href !== profilePath)

  return {
    primary: withoutProfile.slice(0, MOBILE_PRIMARY_SLOTS),
    profileItem,
    overflow: withoutProfile.slice(MOBILE_PRIMARY_SLOTS),
  }
}

function MobileMoreMenu({
  open,
  onClose,
  overflow,
  profileItem,
}: {
  open: boolean
  onClose: () => void
  overflow: DashboardNavItem[]
  profileItem: DashboardNavItem
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { t, textClass } = useLocaleText()

  if (!open) return null

  const handleLogout = () => {
    onClose()
    logout()
    navigate('/')
  }

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t('profilePanel.close')}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[min(85dvh,32rem)] overflow-hidden rounded-t-2xl border-t border-border bg-card shadow-elevated animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className={cn('text-base font-bold', textClass)}>{t('nav.more')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            aria-label={t('profilePanel.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-2">
            {overflow.map((item) => {
              const Icon = item.icon
              const active = isNavItemActive(location.pathname, item.href)
              return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => {
                  onClose()
                  resetScrollPosition()
                }}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center text-xs font-semibold transition-colors',
                    active
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border bg-muted/20 text-foreground hover:bg-muted/40'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn('line-clamp-2', textClass)}>{t(item.labelKey)}</span>
                </Link>
              )
            })}
            <Link
              to={profileItem.href}
              onClick={() => {
                onClose()
                resetScrollPosition()
              }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center text-xs font-semibold transition-colors',
                isNavItemActive(location.pathname, profileItem.href)
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-muted/20 text-foreground hover:bg-muted/40'
              )}
            >
              <User className="h-5 w-5 shrink-0" />
              <span className={cn('line-clamp-2', textClass)}>{t(profileItem.labelKey)}</span>
            </Link>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
            >
              <LogOut className="h-5 w-5" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MobileBottomNav({ items, profilePath }: MobileBottomNavProps) {
  const location = useLocation()
  const { t, textClass } = useLocaleText()
  const [moreOpen, setMoreOpen] = useState(false)

  const { primary, profileItem, overflow } = useMemo(
    () => buildMobileNavSlots(items, profilePath),
    [items, profilePath]
  )

  const moreActive =
    moreOpen ||
    isNavItemActive(location.pathname, profileItem.href) ||
    overflow.some((item) => isNavItemActive(location.pathname, item.href))

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {primary.map((item) => {
            const Icon = item.icon
            const active = isNavItemActive(location.pathname, item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={resetScrollPosition}
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

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              'cta-interactive flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium',
              moreActive ? 'text-primary' : 'text-muted-foreground'
            )}
            aria-label={t('nav.more')}
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span className={cn('max-w-[4.5rem] truncate', textClass)}>{t('nav.more')}</span>
          </button>
        </div>
      </nav>

      <MobileMoreMenu
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        overflow={overflow}
        profileItem={profileItem}
      />
    </>
  )
}
