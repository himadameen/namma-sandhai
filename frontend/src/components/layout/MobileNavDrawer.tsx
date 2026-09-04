import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Images,
  LogOut,
  Sparkles,
  Store,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

type NavLink = {
  href: string
  label: string
  anchor: boolean
  icon: LucideIcon
}

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
  navLinks: NavLink[]
  isActive: (href: string) => boolean
  isAuthenticated: boolean
  userName?: string | null
  dashboardPath: string
  onLogout: () => void
  isTamil: boolean
  textClass: string
}

function NavTile({
  link,
  isActive,
  onClose,
  textClass,
}: {
  link: NavLink
  isActive: boolean
  onClose: () => void
  textClass: string
}) {
  const Icon = link.icon
  const className = cn(
    'flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-card px-2 py-3 text-center transition-colors active:bg-muted',
    isActive && 'border-primary/20 bg-primary/[0.06]'
  )

  const inner = (
    <>
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          isActive ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn('text-[11px] font-semibold leading-tight text-foreground', textClass)}>
        {link.label}
      </span>
    </>
  )

  if (link.anchor) {
    return (
      <a href={link.href} className={className} onClick={onClose}>
        {inner}
      </a>
    )
  }

  return (
    <Link to={link.href} className={className} onClick={onClose}>
      {inner}
    </Link>
  )
}

export function MobileNavDrawer({
  open,
  onClose,
  navLinks,
  isActive,
  isAuthenticated,
  userName,
  dashboardPath,
  onLogout,
  isTamil,
  textClass,
}: MobileNavDrawerProps) {
  const { t } = useTranslation()

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-label={t('common.toggleMenu')}>
      <button
        type="button"
        className="mobile-nav-scrim absolute inset-0 bg-primary/30 backdrop-blur-[3px]"
        aria-label={t('common.toggleMenu')}
        onClick={onClose}
      />

      <div className="mobile-nav-panel absolute inset-y-0 right-0 flex h-[100dvh] w-full max-w-[min(100%,20rem)] flex-col overflow-hidden bg-background shadow-elevated">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <Logo size="sm" tamilMode={isTamil} />
          <div className="flex items-center gap-2">
            <LanguageSwitcher size="sm" />
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground"
              aria-label={t('common.toggleMenu')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Single frame — no scroll */}
        <div className="flex min-h-0 flex-1 flex-col justify-between px-4 py-4">
          <nav className={cn('grid grid-cols-2 gap-2', textClass)}>
            {navLinks.map((link) => (
              <NavTile
                key={link.href}
                link={link}
                isActive={isActive(link.href)}
                onClose={onClose}
                textClass={textClass}
              />
            ))}
          </nav>

          <div className="space-y-2.5">
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/register?role=farmer"
                  onClick={onClose}
                  className={cn(
                    'rounded-xl border border-primary/15 bg-primary/[0.06] px-2 py-2.5 text-center text-[11px] font-bold text-primary active:bg-primary/10',
                    textClass
                  )}
                >
                  {t('landing.iAmFarmer')}
                </Link>
                <Link
                  to="/register?role=buyer"
                  onClick={onClose}
                  className={cn(
                    'rounded-xl border border-secondary/15 bg-secondary/[0.06] px-2 py-2.5 text-center text-[11px] font-bold text-secondary active:bg-secondary/10',
                    textClass
                  )}
                >
                  {t('landing.iAmBuyer')}
                </Link>
              </div>
            )}

            {isAuthenticated ? (
              <div className="space-y-2">
                {userName && (
                  <p className={cn('truncate text-center text-xs text-muted-foreground', textClass)}>{userName}</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className={cn('h-10', textClass)} asChild>
                    <Link to={dashboardPath} onClick={onClose}>
                      {t('nav.dashboard')}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className={cn('h-10', textClass)} onClick={onLogout}>
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    {t('nav.logout')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className={cn('h-10', textClass)} asChild>
                  <Link to="/login" onClick={onClose}>
                    {t('nav.login')}
                  </Link>
                </Button>
                <Button size="sm" className={cn('h-10', textClass)} asChild>
                  <Link to="/register" onClick={onClose}>
                    {t('nav.register')}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}

            <p className={cn('pt-1 text-center text-[10px] leading-snug text-muted-foreground/80', textClass)}>
              {t('brand.tagline')}
            </p>
          </div>
        </div>

        <div className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]" aria-hidden />
      </div>
    </div>,
    document.body
  )
}

export const mobileNavLinkIcons = {
  howItWorks: Workflow,
  gallery: Images,
  features: Sparkles,
  marketplace: Store,
} as const
