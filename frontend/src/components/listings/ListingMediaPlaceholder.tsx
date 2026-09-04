import { LogoMark } from '@/components/brand/LogoMark'
import { cn } from '@/lib/utils'

interface ListingMediaPlaceholderProps {
  className?: string
  label?: string
  compact?: boolean
}

export function ListingMediaPlaceholder({ className, label, compact }: ListingMediaPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/8 via-muted/40 to-secondary/10',
        className
      )}
    >
      <LogoMark size={compact ? 'sm' : 'md'} />
      {label && (
        <p
          className={cn(
            'mt-2 px-3 text-center text-xs font-medium leading-relaxed text-muted-foreground',
            compact && 'mt-1 text-[10px]'
          )}
        >
          {label}
        </p>
      )}
    </div>
  )
}
