import { LogoMark } from '@/components/brand/LogoMark'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg' | 'hero'

interface LogoProps {
  size?: LogoSize
  showSubtitle?: boolean
  className?: string
  /** When true, bottom line shows Tamil "சந்தை"; otherwise "SANDHAI" */
  tamilMode?: boolean
  /** Use on primary-colored backgrounds (e.g. footer) */
  variant?: 'default' | 'onPrimary'
  /** Hide the leaf mark (text only) */
  hideMark?: boolean
}

const sizeMap: Record<
  LogoSize,
  { tamil: string; english: string; gap: string; mark: 'sm' | 'md' | 'lg' | 'hero' }
> = {
  sm: {
    tamil: 'text-sm leading-none',
    english: 'text-[10px] tracking-[0.18em]',
    gap: 'gap-0',
    mark: 'sm',
  },
  md: {
    tamil: 'text-base leading-none',
    english: 'text-xs tracking-[0.2em]',
    gap: 'gap-0',
    mark: 'md',
  },
  lg: {
    tamil: 'text-2xl leading-none',
    english: 'text-sm tracking-[0.22em]',
    gap: 'gap-0.5',
    mark: 'lg',
  },
  hero: {
    tamil: 'text-4xl sm:text-5xl leading-none',
    english: 'text-lg sm:text-xl tracking-[0.24em]',
    gap: 'gap-1',
    mark: 'hero',
  },
}

export function Logo({
  size = 'md',
  showSubtitle = false,
  className,
  tamilMode = false,
  variant = 'default',
  hideMark = false,
}: LogoProps) {
  const s = sizeMap[size]
  const onPrimary = variant === 'onPrimary'

  return (
    <div
      className={cn(showSubtitle ? 'inline-flex flex-col' : 'inline-flex items-center gap-2.5', className)}
      aria-label="Namma Sandhai"
    >
      <div className="inline-flex items-center gap-2.5">
        {!hideMark && (
          <LogoMark
            size={s.mark}
            variant={onPrimary ? 'light' : 'default'}
            className={cn(size === 'hero' && 'sm:scale-105')}
          />
        )}

        <div className={cn('inline-flex flex-col items-start', s.gap)}>
          <span
            className={cn(
              'font-tamil font-bold',
              onPrimary ? 'text-primary-foreground' : 'text-primary',
              s.tamil
            )}
          >
            நம்ம
          </span>
          <span
            className={cn(
              'font-sans font-extrabold',
              onPrimary ? 'text-primary-foreground/90' : 'text-secondary',
              s.english
            )}
          >
            {tamilMode ? 'சந்தை' : 'SANDHAI'}
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span
          className={cn(
            'mt-1.5 text-xs font-medium',
            onPrimary ? 'text-primary-foreground/75' : 'text-muted-foreground',
            !hideMark && 'pl-[calc(34px+0.625rem)] sm:pl-[calc(42px+0.625rem)]'
          )}
        >
          {tamilMode ? 'உழைப்புக்கு சரியான விலை.' : 'The right price for every harvest.'}
        </span>
      )}
    </div>
  )
}
