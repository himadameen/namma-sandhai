import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useLocaleText } from '@/hooks/useLocaleText'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  const { textClass } = useLocaleText()

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className={cn('text-2xl font-bold leading-snug text-primary sm:text-3xl', textClass)}>{title}</h1>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className={cn('max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base', textClass)}>
          {description}
        </p>
      )}
    </div>
  )
}
