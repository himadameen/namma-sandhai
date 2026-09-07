import { Outlet } from 'react-router-dom'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { FloatingThemeToggle } from '@/components/layout/FloatingThemeToggle'
import {
  DashboardSidebar,
  MobileBottomNav,
  adminNavItems,
  buyerNavItems,
  farmerNavItems,
} from '@/components/layout/DashboardSidebar'
import { DashboardShellProvider, useDashboardShell } from '@/store/dashboardShell'
import { cn } from '@/lib/utils'

function DashboardShell({
  navItems,
  homeHref,
  roleLabelKey,
  profilePath,
}: {
  navItems: typeof farmerNavItems
  homeHref: string
  roleLabelKey: string
  profilePath: string
}) {
  const { collapsed } = useDashboardShell()

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar items={navItems} homeHref={homeHref} />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[margin-left] duration-300 ease-out',
          collapsed ? 'md:ml-[4.5rem]' : 'md:ml-64'
        )}
      >
        <DashboardHeader roleLabelKey={roleLabelKey} profilePath={profilePath} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:px-6 md:pb-8 lg:px-8">
          <Outlet />
        </main>
        <MobileBottomNav items={navItems} profilePath={profilePath} />
      </div>

      <FloatingThemeToggle />
    </div>
  )
}

function DashboardShellLayout(props: {
  navItems: typeof farmerNavItems
  homeHref: string
  roleLabelKey: string
  profilePath: string
}) {
  return (
    <DashboardShellProvider>
      <DashboardShell {...props} />
    </DashboardShellProvider>
  )
}

export function FarmerLayout() {
  return (
    <DashboardShellLayout
      navItems={farmerNavItems}
      homeHref="/farmer/dashboard"
      roleLabelKey="panel.roleFarmer"
      profilePath="/farmer/profile"
    />
  )
}

export function BuyerLayout() {
  return (
    <DashboardShellLayout
      navItems={buyerNavItems}
      homeHref="/buyer/dashboard"
      roleLabelKey="panel.roleBuyer"
      profilePath="/buyer/profile"
    />
  )
}

export function AdminLayout() {
  return (
    <DashboardShellLayout
      navItems={adminNavItems}
      homeHref="/admin"
      roleLabelKey="panel.roleAdmin"
      profilePath="/admin/profile"
    />
  )
}
