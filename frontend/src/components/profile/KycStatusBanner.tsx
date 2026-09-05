import { AlertCircle, CheckCircle2, Clock, Info, ShieldCheck } from 'lucide-react'
import type { KycStatus } from '@/api/profile'
import { cn } from '@/lib/utils'

interface KycStatusBannerProps {
  status: KycStatus
  uploadedCount: number
  requiredCount: number
  title: string
  message: string
  progressLabel: string
}

const STATUS_CONFIG: Record<
  KycStatus,
  { icon: typeof Info; tone: string; border: string; bg: string }
> = {
  NOT_STARTED: {
    icon: Info,
    tone: 'text-primary',
    border: 'border-primary/25',
    bg: 'bg-primary/5',
  },
  INCOMPLETE: {
    icon: AlertCircle,
    tone: 'text-accent-foreground',
    border: 'border-accent/30',
    bg: 'bg-accent/10',
  },
  SUBMITTED: {
    icon: Clock,
    tone: 'text-secondary',
    border: 'border-secondary/30',
    bg: 'bg-secondary/10',
  },
  VERIFIED: {
    icon: ShieldCheck,
    tone: 'text-success',
    border: 'border-success/30',
    bg: 'bg-success/10',
  },
}

export function KycStatusBanner({
  status,
  uploadedCount,
  requiredCount,
  title,
  message,
  progressLabel,
}: KycStatusBannerProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const progress = requiredCount > 0 ? Math.round((uploadedCount / requiredCount) * 100) : 0

  return (
    <div className={cn('rounded-2xl border p-4 sm:p-5', config.border, config.bg)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card/80',
            config.tone
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{message}</p>
          </div>

          {status !== 'VERIFIED' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{progressLabel}</span>
                <span>
                  {uploadedCount}/{requiredCount}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-card/80">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    status === 'SUBMITTED' ? 'bg-secondary' : 'bg-primary'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === 'VERIFIED' && (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              {title}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
