import { LogoMark } from '@/components/brand/LogoMark'
import { cn } from '@/lib/utils'

interface LogoWatermarkProps {
  tamilMode?: boolean
  className?: string
  size?: 'sm' | 'lg'
}

export function LogoWatermark({ tamilMode = false, className, size = 'lg' }: LogoWatermarkProps) {
  const isLarge = size === 'lg'

  return (
    <div
      className={cn('pointer-events-none flex select-none flex-col items-center text-center', className)}
      aria-hidden
    >
      <LogoMark
        size={isLarge ? 'lg' : 'sm'}
        variant="muted"
        className={cn('opacity-40', isLarge ? 'mb-3' : 'mb-1.5')}
      />
      <p
        className={cn(
          'font-tamil font-bold text-white/90',
          isLarge ? 'text-5xl sm:text-6xl' : 'text-2xl'
        )}
      >
        நம்ம
      </p>
      <p
        className={cn(
          'font-sans font-extrabold tracking-[0.28em] text-white/75',
          isLarge ? 'mt-1 text-xl sm:text-2xl' : 'mt-0.5 text-xs'
        )}
      >
        {tamilMode ? 'சந்தை' : 'SANDHAI'}
      </p>
    </div>
  )
}
