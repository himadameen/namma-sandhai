import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { DashboardProfilePanel } from '@/components/layout/DashboardProfilePanel'
import { useAuth } from '@/store/auth'
import { useLocaleText } from '@/hooks/useLocaleText'
import { formatDisplayId } from '@/utils/displayId'
import { getDashboardPath } from '@/utils/auth'
import { resolveMediaUrl } from '@/utils/media'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  roleLabelKey?: string
  profilePath?: string
}

export function DashboardHeader({ roleLabelKey, profilePath = '/farmer/profile' }: DashboardHeaderProps) {
  const { user } = useAuth()
  const { t, isTamil, textClass } = useLocaleText()
  const [profileOpen, setProfileOpen] = useState(false)

  const dashboardPath = user ? getDashboardPath(user.role) : '/'
  const displayId = formatDisplayId(user?.farmerId ?? user?.buyerId ?? user?.id, user?.role)
  const avatarUrl = user?.profileImageUrl ? resolveMediaUrl(user.profileImageUrl) : ''

  return (
    <>
      <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-border bg-card">
        <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={dashboardPath} className="shrink-0 md:hidden">
              <Logo size="sm" tamilMode={isTamil} />
            </Link>
            {roleLabelKey && (
              <span
                className={cn(
                  'inline-flex items-center rounded-lg bg-primary/[0.08] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary dark:bg-primary/15 sm:text-sm',
                  textClass
                )}
              >
                {t(roleLabelKey)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher size="sm" />

            {user && (
              <>
                <div className="hidden h-5 w-px shrink-0 bg-border/50 sm:block" aria-hidden />

                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  aria-expanded={profileOpen}
                  aria-haspopup="dialog"
                  aria-label={t('profilePanel.title')}
                  className="group flex items-center gap-2 rounded-lg px-0.5 py-1 text-left transition-colors sm:gap-2.5"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-primary/15 transition-all group-hover:bg-primary/15 group-hover:ring-primary/30">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name || user.email} className="h-full w-full object-cover" />
                    ) : (
                      <span aria-hidden>{(user.name ?? '?').charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p
                      className={cn(
                        'truncate text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary',
                        textClass
                      )}
                    >
                      {user.name || user.organization}
                    </p>
                    <p className="font-mono text-[11px] font-medium leading-tight tracking-wide text-muted-foreground">
                      {displayId}
                    </p>
                  </div>

                  <ChevronDown
                    className={cn(
                      'hidden h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-hover:text-muted-foreground sm:block',
                      profileOpen && 'rotate-180'
                    )}
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <DashboardProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profilePath={profilePath}
      />
    </>
  )
}
