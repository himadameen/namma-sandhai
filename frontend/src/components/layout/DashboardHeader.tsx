import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { getDashboardPath } from '@/utils/auth'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title?: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath = user ? getDashboardPath(user.role) : '/'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        <Link to="/" className="min-w-0 font-tamil text-lg font-bold text-primary">
          🌾 {title ?? t('brand.nameTamil')}
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <span className="hidden max-w-[140px] truncate text-sm text-muted-foreground sm:inline">
              {user.name || user.organization}
            </span>
          )}
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to={dashboardPath}>{t('nav.dashboard')}</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{t('nav.logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
