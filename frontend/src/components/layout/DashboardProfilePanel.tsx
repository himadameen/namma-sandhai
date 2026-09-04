import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import {
  ChevronRight,
  FileText,
  BarChart3,
  UserPen,
  Upload,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { profileApi, type BuyerProfile, type FarmerProfile } from '@/api/profile'
import { useAuth } from '@/store/auth'
import { useLocaleText } from '@/hooks/useLocaleText'
import { formatDisplayId } from '@/utils/displayId'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DashboardProfilePanelProps {
  open: boolean
  onClose: () => void
  profilePath: string
}

export function DashboardProfilePanel({ open, onClose, profilePath }: DashboardProfilePanelProps) {
  const { user } = useAuth()
  const { t, textClass } = useLocaleText()
  const panelRef = useRef<HTMLDivElement>(null)

  const { data: profile, isLoading } = useQuery<FarmerProfile | BuyerProfile>({
    queryKey: ['dashboard-profile-panel', user?.role],
    queryFn: async () => {
      if (user?.role === 'BUYER') return profileApi.getBuyerProfile()
      return profileApi.getFarmerProfile()
    },
    enabled: open && (user?.role === 'FARMER' || user?.role === 'BUYER'),
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const displayId = formatDisplayId(user?.farmerId ?? user?.buyerId, user?.role)

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t('profilePanel.close')}
      />
      <div
        ref={panelRef}
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-elevated animate-in slide-in-from-right duration-300"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <h2 className={cn('text-lg font-bold text-primary', textClass)}>{t('profilePanel.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t('profilePanel.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {(user?.name ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className={cn('truncate text-lg font-bold text-foreground', textClass)}>{user?.name}</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-primary">{displayId}</p>
              {user?.isVerified && (
                <Badge variant="success" className="mt-2 gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {t('common.verified')}
                </Badge>
              )}
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
          ) : profile ? (
            <div className="mt-6 space-y-4 rounded-2xl border border-border p-4">
              <h3 className={cn('text-sm font-bold uppercase tracking-wide text-muted-foreground', textClass)}>
                {t('profilePanel.details')}
              </h3>
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t('auth.email')}</dt>
                  <dd className="font-medium">{profile.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('profile.phone')}</dt>
                  <dd className="font-medium">{profile.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('profile.district')}</dt>
                  <dd className="font-medium">{profile.district}</dd>
                </div>
                {'farmSize' in profile && profile.farmSize && (
                  <div>
                    <dt className="text-muted-foreground">{t('profile.farmSize')}</dt>
                    <dd className="font-medium">{profile.farmSize}</dd>
                  </div>
                )}
                {'organization' in profile && profile.organization && (
                  <div>
                    <dt className="text-muted-foreground">{t('profile.organization')}</dt>
                    <dd className="font-medium">{profile.organization}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            <h3 className={cn('text-sm font-bold uppercase tracking-wide text-muted-foreground', textClass)}>
              {t('profilePanel.documents')}
            </h3>
            {[
              { key: 'profilePanel.docAadhaar', status: 'verified' as const },
              { key: 'profilePanel.docLand', status: 'pending' as const },
              { key: 'profilePanel.docBank', status: 'upload' as const },
            ].map(({ key, status }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className={cn('text-sm font-medium', textClass)}>{t(key)}</span>
                </div>
                {status === 'verified' ? (
                  <Badge variant="success">{t('common.verified')}</Badge>
                ) : status === 'pending' ? (
                  <Badge variant="accent">{t('profilePanel.pending')}</Badge>
                ) : (
                  <Button size="sm" variant="outline" className={textClass}>
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    {t('profilePanel.upload')}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className={cn('text-sm font-bold uppercase tracking-wide text-muted-foreground', textClass)}>
              {t('profilePanel.reports')}
            </h3>
            <Link
              to="/farmer/sales"
              onClick={onClose}
              className="cta-interactive flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-secondary" />
                <span className={cn('text-sm font-medium', textClass)}>{t('profilePanel.salesReport')}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/farmer/market-prices"
              onClick={onClose}
              className="cta-interactive flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-accent-foreground" />
                <span className={cn('text-sm font-medium', textClass)}>{t('profilePanel.marketReport')}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="shrink-0 border-t border-border p-4">
          <Button asChild className={cn('w-full', textClass)}>
            <Link to={profilePath} onClick={onClose}>
              <UserPen className="mr-2 h-4 w-4" />
              {t('profilePanel.editProfile')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
