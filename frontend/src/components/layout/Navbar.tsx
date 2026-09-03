import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useAuth } from '@/store/auth'
import { getDashboardPath } from '@/utils/auth'
import { Logo } from '@/components/brand/Logo'
import { useScrollY } from '@/hooks/useScrollY'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScrollY(8)
  const isTamil = i18n.language?.startsWith('ta')
  const isHome = location.pathname === '/'
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  const navLinks = [
    { href: '/#how-it-works', label: t('nav.howItWorks'), anchor: true },
    { href: '/#gallery', label: t('nav.gallery'), anchor: true },
    { href: '/#features', label: t('nav.features'), anchor: true },
    { href: '/marketplace', label: t('nav.marketplace'), anchor: false },
  ]

  const isActive = (href: string) => !href.startsWith('/#') && location.pathname === href

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

  const dashboardPath = user ? getDashboardPath(user.role) : '/'

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled || !isHome
          ? 'border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-lg'
          : 'border-b border-border/40 bg-background/80 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <Logo size="sm" tamilMode={isTamil} />
        </Link>

        {/* Center nav — pill group */}
        <nav
          className={cn(
            'mx-auto hidden items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-1 lg:flex',
            textClass
          )}
        >
          {navLinks.map((link) =>
            link.anchor ? (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-primary"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-background hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher size="sm" />
          <div className="h-5 w-px bg-border" aria-hidden />

          {isAuthenticated && user ? (
            <>
              <span className="max-w-[100px] truncate text-sm text-muted-foreground">
                {user.name || user.organization}
              </span>
              <Button variant="outline" size="sm" className={textClass} asChild>
                <Link to={dashboardPath}>{t('nav.dashboard')}</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t('nav.logout')}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className={textClass} asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" className={textClass} asChild>
                <Link to="/register">{t('nav.register')}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <LanguageSwitcher size="sm" />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('common.toggleMenu')}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] md:hidden"
            aria-label={t('common.toggleMenu')}
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background shadow-elevated md:hidden">
            <nav className={cn('flex flex-col gap-1 px-4 py-4', textClass)}>
              {navLinks.map((link) =>
                link.anchor ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-base font-medium text-foreground/85 active:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'rounded-xl px-4 py-3 text-base font-medium active:bg-muted',
                      isActive(link.href) ? 'bg-primary/8 text-primary' : 'text-foreground/85'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
            <div className="flex flex-col gap-2.5 border-t border-border px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {isAuthenticated && user ? (
                <>
                  <p className={cn('truncate px-1 text-sm text-muted-foreground', textClass)}>
                    {user.name || user.organization}
                  </p>
                  <Button variant="outline" size="lg" className={cn('w-full', textClass)} asChild>
                    <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                      {t('nav.dashboard')}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className={cn('w-full', textClass)} onClick={handleLogout}>
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="lg" className={cn('w-full', textClass)} asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      {t('nav.login')}
                    </Link>
                  </Button>
                  <Button size="lg" className={cn('w-full', textClass)} asChild>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      {t('nav.register')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
