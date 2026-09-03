import { createElement } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

type SectionBgVariant = 'dots' | 'diagonal' | 'waves' | 'mesh' | 'grain'
type SectionTone = 'default' | 'muted' | 'primary' | 'card'

const toneClass: Record<SectionTone, string> = {
  default: 'bg-background',
  muted: 'bg-muted/40',
  primary: 'bg-primary/[0.04]',
  card: 'bg-card',
}

interface SectionBackgroundProps {
  children: React.ReactNode
  variant?: SectionBgVariant
  tone?: SectionTone
  className?: string
  as?: 'section' | 'div'
  id?: string
  bordered?: boolean
}

export function SectionBackground({
  children,
  variant = 'dots',
  tone = 'default',
  className,
  as: Tag = 'section',
  id,
  bordered = true,
}: SectionBackgroundProps) {
  const { ref, inView } = useInView<HTMLElement>(0.06)

  return createElement(
    Tag,
    {
      id,
      ref,
      className: cn(
        'relative overflow-hidden',
        toneClass[tone],
        bordered && 'border-t border-border',
        className
      ),
    },
    <>
      <div
        className={cn('section-bg-pattern pointer-events-none absolute inset-0', `section-bg-${variant}`)}
        aria-hidden
      />
      <div
        className={cn(
          'section-blob section-blob-a pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl',
          inView && 'section-blob-visible'
        )}
        aria-hidden
      />
      <div
        className={cn(
          'section-blob section-blob-b pointer-events-none absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl',
          inView && 'section-blob-visible'
        )}
        style={{ transitionDelay: '120ms' }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </>
  )
}
