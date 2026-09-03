import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, Sprout, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUPPORT_EMAIL = 'support@nammasandhai.in'
const SUPPORT_PHONE = '+914412345678'
const SUPPORT_PHONE_DISPLAY = '+91 44 1234 5678'

function RotatingRing({
  text,
  paused,
  tamilMode,
  className,
}: {
  text: string
  paused: boolean
  tamilMode?: boolean
  className?: string
}) {
  const pathId = useId()

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn(
        'helpdesk-ring-spin pointer-events-none absolute inset-0 h-full w-full',
        paused && 'helpdesk-ring-paused',
        className
      )}
      aria-hidden
    >
      <defs>
        <path
          id={pathId}
          d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
        />
      </defs>
      <text
        className={cn(
          'fill-primary font-bold uppercase tracking-[0.18em]',
          tamilMode ? 'font-tamil text-[8px]' : 'text-[9.5px]'
        )}
      >
        <textPath href={`#${pathId}`} startOffset="0%">
          {text}
        </textPath>
      </text>
    </svg>
  )
}

export function HelpdeskWidget() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    const onPointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    <div
      ref={panelRef}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[60] sm:bottom-6 sm:right-6"
    >
      <div
        className={cn(
          'absolute bottom-[calc(100%+12px)] right-0 w-[min(calc(100vw-1.5rem),18rem)] origin-bottom-right transition-all duration-300 ease-out sm:bottom-[calc(100%+16px)]',
          open
            ? 'pointer-events-auto scale-100 opacity-100 translate-y-0'
            : 'pointer-events-none scale-95 opacity-0 translate-y-2'
        )}
        role="dialog"
        aria-label={t('helpdesk.title')}
        aria-hidden={!open}
      >
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-elevated">
          <div className="bg-gradient-to-r from-primary to-secondary px-4 py-3 text-primary-foreground">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn('text-sm font-bold', textClass)}>{t('helpdesk.title')}</p>
                <p className={cn('mt-0.5 text-xs text-primary-foreground/85', textClass)}>
                  {t('helpdesk.subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-white/15"
                aria-label={t('helpdesk.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 p-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('helpdesk.emailSubject'))}`}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5',
                textClass
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{t('helpdesk.email')}</span>
                <span className="block truncate text-sm font-medium">{SUPPORT_EMAIL}</span>
              </span>
            </a>

            <a
              href={`tel:${SUPPORT_PHONE}`}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-secondary/30 hover:bg-secondary/5',
                textClass
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Phone className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{t('helpdesk.phone')}</span>
                <span className="block text-sm font-medium">{SUPPORT_PHONE_DISPLAY}</span>
              </span>
            </a>

            <p className={cn('px-1 pt-1 text-center text-[11px] text-muted-foreground', textClass)}>
              {t('helpdesk.hours')}
            </p>
          </div>
        </div>
      </div>

      {/* FAB with rotating ring text */}
      <div className="relative h-[4.75rem] w-[4.75rem] sm:h-[5.75rem] sm:w-[5.75rem]">
        <RotatingRing text={t('helpdesk.ringText')} paused={open} tamilMode={isTamil} />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={t('helpdesk.open')}
          className={cn(
            'helpdesk-fab group absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full sm:h-14 sm:w-14',
            'bg-primary text-primary-foreground shadow-elevated transition-transform hover:scale-105 active:scale-95',
            open && 'ring-2 ring-accent/50 ring-offset-2 ring-offset-background'
          )}
        >
          <span className="helpdesk-pulse absolute inset-0 rounded-full bg-primary" aria-hidden />
          <span
            className="helpdesk-pulse helpdesk-pulse-delay absolute inset-0 rounded-full bg-primary"
            aria-hidden
          />
          {open ? (
            <X className="relative h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Sprout className="relative h-5 w-5 transition-transform group-hover:-rotate-12 sm:h-6 sm:w-6" />
          )}
        </button>
      </div>
    </div>
  )
}
