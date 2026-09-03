import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HeroTagline({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-primary/15',
        'bg-gradient-to-r from-white via-white to-primary/[0.04] px-4 py-3 shadow-card',
        'ring-1 ring-primary/5 backdrop-blur-sm',
        className
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-destructive via-accent to-secondary" />

      <div className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Sparkles className="h-5 w-5 text-accent" aria-hidden />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Namma Sandhai
        </p>
        <p className={cn('text-sm font-semibold leading-snug text-primary sm:text-base', textClass)}>
          {t('brand.tagline')}
        </p>
      </div>
    </div>
  )
}
