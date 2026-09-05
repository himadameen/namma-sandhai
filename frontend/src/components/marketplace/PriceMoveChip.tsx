import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { DailyPriceMove } from '@/api/listings'
import { formatCurrency, cn } from '@/lib/utils'
import { useLocaleText } from '@/hooks/useLocaleText'

export function PriceMoveChip({
  move,
  compact = false,
  showPercent = true,
  className,
}: {
  move: DailyPriceMove
  compact?: boolean
  showPercent?: boolean
  className?: string
}) {
  const { t } = useLocaleText()
  const amount = formatCurrency(Math.abs(move.change))
  const percent = Math.abs(move.percentChange)
  const tone =
    move.direction === 'up'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800'
      : move.direction === 'down'
        ? 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/50 dark:border-rose-800'
        : 'text-muted-foreground bg-muted/50 border-border'

  const Icon = move.direction === 'up' ? TrendingUp : move.direction === 'down' ? TrendingDown : Minus
  const label =
    move.direction === 'up'
      ? t('market.increasedBy', { amount })
      : move.direction === 'down'
        ? t('market.decreasedBy', { amount })
        : t('market.unchanged')

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums',
        tone,
        className
      )}
      title={`${t('market.yesterday')} ${formatCurrency(move.yesterdayPrice)} → ${t('market.today')} ${formatCurrency(move.todayPrice)}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {compact ? (
        <span>
          {move.direction === 'up' ? '+' : move.direction === 'down' ? '−' : ''}
          {amount}
          {showPercent && percent > 0 ? ` (${percent}%)` : ''}
        </span>
      ) : (
        <span>
          {label}
          {showPercent && percent > 0 ? ` (${percent}%)` : ''}
        </span>
      )}
    </span>
  )
}
