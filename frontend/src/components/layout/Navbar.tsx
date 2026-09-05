import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { MobileNavDrawer, mobileNavLinkIcons } from '@/components/layout/MobileNavDrawer'
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

  const marketplaceHref = isAuthenticated && user?.role === 'BUYER' ? '/buyer/marketplace' : '/marketplace'

  const navLinks = [
    { href: '/#how-it-works', label: t('nav.howItWorks'), anchor: true, icon: mobileNavLinkIcons.howItWorks },
    { href: '/#gallery', label: t('nav.gallery'), anchor: true, icon: mobileNavLinkIcons.gallery },
    { href: '/#features', label: t('nav.features'), anchor: true, icon: mobileNavLinkIcons.features },
    { href: marketplaceHref, label: t('nav.marketplace'), anchor: false, icon: mobileNavLinkIcons.marketplace },
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

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled || !isHome
            ? 'border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-lg'
            : 'border-b border-border/40 bg-background/90 backdrop-blur-md'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="min-w-0 shrink-0" aria-label={t('nav.home')}>
            <Logo size="sm" tamilMode={isTamil} />
          </Link>

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

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <LanguageSwitcher size="sm" />
            <button
              type="button"
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors',
                mobileOpen && 'border-primary/25 bg-primary/5 text-primary'
              )}
              onClick={() => setMobileOpen(true)}
              aria-label={t('common.toggleMenu')}
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        isActive={isActive}
        isAuthenticated={isAuthenticated}
        userName={user?.name || user?.organization}
        dashboardPath={dashboardPath}
        onLogout={handleLogout}
        isTamil={isTamil}
        textClass={textClass}
      />
    </>
  )
}
