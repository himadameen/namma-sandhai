import type { LucideIcon } from 'lucide-react'
import { Search, Medal } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ResponsiveContainer } from 'recharts'

export const ADMIN_CHART_COLORS = ['#3F8F5F', '#164A35', '#D9A441', '#6ee7a8', '#fbbf24', '#94a89c']

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'primary',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  accent?: 'primary' | 'secondary' | 'accent' | 'destructive'
}) {
  const accents = {
    primary: 'from-primary/15 to-primary/5 text-primary',
    secondary: 'from-secondary/15 to-secondary/5 text-secondary',
    accent: 'from-accent/20 to-accent/5 text-accent-foreground',
    destructive: 'from-destructive/15 to-destructive/5 text-destructive',
  }

  return (
    <Card className="h-full overflow-hidden border-border/80 shadow-card transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col p-3.5 sm:p-4">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
            accents[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="mt-3 min-w-0">
          <p className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">{label}</p>
          <p className="mt-0.5 text-xl font-bold leading-tight tracking-tight text-foreground">{value}</p>
          {trend ? (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
              {trend}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartFrame({ children, height = 280 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

export function AdminChartTooltip({
  active,
  payload,
  label,
  valuePrefix = '₹',
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
  valuePrefix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-elevated">
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          {valuePrefix === '₹' ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

export function MedalBadge({
  medal,
  size = 'md',
  className,
}: {
  medal: 'gold' | 'silver' | 'bronze' | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  if (!medal) {
    return (
      <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground', className)}>
        —
      </span>
    )
  }

  const styles = {
    gold: 'text-amber-500 bg-gradient-to-br from-amber-100 to-amber-50 ring-2 ring-amber-300/60 dark:from-amber-950 dark:to-amber-900 dark:ring-amber-600/40',
    silver: 'text-slate-500 bg-gradient-to-br from-slate-100 to-slate-50 ring-2 ring-slate-300/60 dark:from-slate-900 dark:to-slate-800 dark:ring-slate-500/40',
    bronze: 'text-orange-700 bg-gradient-to-br from-orange-100 to-orange-50 ring-2 ring-orange-300/60 dark:from-orange-950 dark:to-orange-900 dark:ring-orange-600/40',
  }
  const sizes = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-11 w-11' }
  const iconSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110',
        sizes[size],
        styles[medal],
        className
      )}
      aria-label={medal}
    >
      <Medal className={iconSizes[size]} fill="currentColor" strokeWidth={1.5} />
    </span>
  )
}

export function GrowthChip({
  growth,
  momLabel,
  newLabel = 'New',
  noActivityLabel = 'No activity',
}: {
  growth: { growthPercent: number | null; direction: string; label?: string }
  momLabel?: string
  newLabel?: string
  noActivityLabel?: string
}) {
  if (growth.label === 'new') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        {newLabel}
      </span>
    )
  }

  if (growth.label === 'no_activity') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
        {noActivityLabel}
      </span>
    )
  }

  const color =
    growth.direction === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : growth.direction === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground'
  const prefix = growth.direction === 'up' ? '+' : growth.direction === 'down' ? '' : ''

  return (
    <span className={cn('text-xs font-semibold tabular-nums', color)}>
      {prefix}
      {growth.growthPercent ?? 0}%
      {momLabel ? <span className="ml-1 font-normal text-muted-foreground">{momLabel}</span> : null}
    </span>
  )
}

export function AdminSectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="pt-6 sm:pt-7">{children}</CardContent>
    </Card>
  )
}

export function AdminContentCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0 sm:p-0">{children}</CardContent>
    </Card>
  )
}

export function AdminFilterBar({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-border/80 bg-muted/20">
      <CardContent className="flex flex-wrap items-center gap-3 p-3 sm:p-4">{children}</CardContent>
    </Card>
  )
}

export function AdminFilterSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative min-w-[12rem] flex-1 basis-[200px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-10 pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>
}

export function AdminQueryError({
  message,
  onRetry,
  retryLabel,
}: {
  message: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {retryLabel ?? 'Retry'}
        </button>
      ) : null}
    </div>
  )
}
