import { useTranslation } from 'react-i18next'
import { BarChart3, ShieldCheck, Sprout, Truck, Users } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

interface AuthBrandPanelProps {
  mode: 'login' | 'register'
  className?: string
}

const features = [
  { key: 'authPanel.feature1', icon: BarChart3 },
  { key: 'authPanel.feature2', icon: Users },
  { key: 'authPanel.feature3', icon: ShieldCheck },
] as const

const registerHighlights = [
  { key: 'authPanel.farmerHighlight', icon: Sprout, tone: 'primary' as const },
  { key: 'authPanel.buyerHighlight', icon: Truck, tone: 'secondary' as const },
] as const

const loginHighlights = [
  { key: 'authPanel.loginFarmerHighlight', icon: Sprout, tone: 'primary' as const },
  { key: 'authPanel.loginBuyerHighlight', icon: Truck, tone: 'secondary' as const },
  { key: 'authPanel.loginAdminHighlight', icon: ShieldCheck, tone: 'primary' as const },
] as const

export function AuthBrandPanel({ mode, className }: AuthBrandPanelProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-8 text-primary-foreground lg:rounded-3xl lg:p-10',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />

      <div className="relative">
        <Logo size="lg" tamilMode={isTamil} variant="onPrimary" className="mb-8" />
        <h1 className={cn('text-2xl font-bold leading-tight lg:text-3xl', textClass)}>
          {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
        </h1>
        <p className={cn('mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/85 lg:text-base', textClass)}>
          {mode === 'login' ? t('authPanel.loginSubtitle') : t('authPanel.registerSubtitle')}
        </p>

        <ul className="mt-8 space-y-3">
          {features.map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-4 w-4" />
              </span>
              <span className={cn('text-sm font-medium text-primary-foreground/90', textClass)}>{t(key)}</span>
            </li>
          ))}
        </ul>

        {mode === 'register' && (
          <div className="mt-8 hidden space-y-2 lg:block">
            {registerHighlights.map(({ key, icon: Icon, tone }) => (
              <div
                key={key}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3',
                  tone === 'primary' ? 'border-white/20 bg-white/10' : 'border-white/15 bg-white/5'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn('text-xs leading-snug text-primary-foreground/85', textClass)}>{t(key)}</span>
              </div>
            ))}
          </div>
        )}

        {mode === 'login' && (
          <div className="mt-8 hidden space-y-2 lg:block">
            {loginHighlights.map(({ key, icon: Icon, tone }) => (
              <div
                key={key}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3',
                  tone === 'primary' ? 'border-white/20 bg-white/10' : 'border-white/15 bg-white/5'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn('text-xs leading-snug text-primary-foreground/85', textClass)}>{t(key)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className={cn('relative mt-8 hidden text-xs text-primary-foreground/60 lg:block', textClass)}>
        {t('brand.tagline')}
      </p>
    </div>
  )
}

interface AuthLayoutProps {
  mode: 'login' | 'register'
  children: React.ReactNode
  aside?: React.ReactNode
}

export function AuthLayout({ mode, children, aside }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full min-w-0 overflow-x-hidden bg-gradient-to-b from-primary/[0.04] via-background to-background px-3 py-6 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-stretch gap-6 lg:grid-cols-2 lg:gap-8 xl:max-w-7xl">
        <AuthBrandPanel mode={mode} className="hidden lg:flex lg:h-auto lg:min-h-full" />

        <div className="flex min-h-full min-w-0 w-full flex-col">
          <div className="flex min-h-full w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-elevated lg:rounded-3xl">
            {children}
          </div>

          {aside && <div className="mt-5 w-full min-w-0 shrink-0 lg:mt-6">{aside}</div>}
        </div>
      </div>
    </div>
  )
}
