import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

const exploreLinks = [
  { href: '/#how-it-works', labelKey: 'nav.howItWorks', anchor: true },
  { href: '/#gallery', labelKey: 'nav.gallery', anchor: true },
  { href: '/#features', labelKey: 'nav.features', anchor: true },
  { href: '/marketplace', labelKey: 'nav.marketplace', anchor: false },
] as const

const accountLinks = [
  { href: '/login', labelKey: 'nav.login' },
  { href: '/register', labelKey: 'nav.register' },
] as const

export function Footer() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <footer className="mt-auto border-t border-border bg-background">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Logo size="md" tamilMode={isTamil} />
            <p className={cn('mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground', textClass)}>
              {t('footer.description')}
            </p>
            <p className={cn('mt-3 text-xs text-muted-foreground/80', textClass)}>
              {t('brand.tagline')}
            </p>
          </div>

          {/* Explore */}
          <div className="lg:col-span-3">
            <h4 className={cn('text-xs font-bold uppercase tracking-wider text-primary', textClass)}>
              {t('nav.home')}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  {link.anchor ? (
                    <a
                      href={link.href}
                      className={cn(
                        'text-sm text-muted-foreground transition-colors hover:text-primary',
                        textClass
                      )}
                    >
                      {t(link.labelKey)}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className={cn(
                        'text-sm text-muted-foreground transition-colors hover:text-primary',
                        textClass
                      )}
                    >
                      {t(link.labelKey)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="lg:col-span-2">
            <h4 className={cn('text-xs font-bold uppercase tracking-wider text-primary', textClass)}>
              {t('nav.profile')}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={cn(
                      'text-sm text-muted-foreground transition-colors hover:text-primary',
                      textClass
                    )}
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/marketplace"
                  className={cn(
                    'text-sm text-muted-foreground transition-colors hover:text-primary',
                    textClass
                  )}
                >
                  {t('common.searchProduce')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-3 lg:col-span-2 lg:items-end">
            <h4 className={cn('text-xs font-bold uppercase tracking-wider text-primary lg:text-right', textClass)}>
              {t('common.language')}
            </h4>
            <LanguageSwitcher size="sm" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-primary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className={cn('text-center text-xs text-primary-foreground/75 sm:text-left', textClass)}>
            {t('footer.copyright')}
          </p>
          <p className={cn('text-xs text-primary-foreground/60', textClass)}>{t('footer.madeIn')}</p>
        </div>
      </div>
    </footer>
  )
}
