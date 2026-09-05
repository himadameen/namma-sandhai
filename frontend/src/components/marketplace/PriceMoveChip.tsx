import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { DailyPriceMove } from '@/api/listings'
import { formatCurrency, cn } from '@/lib/utils'
import { useLocaleText } from '@/hooks/useLocaleText'

export function PriceMoveChip({
  move,
  compact = false,
  className,
}: {
  move: DailyPriceMove
  compact?: boolean
  className?: string
}) {
  const { t } = useLocaleText()
  const amount = formatCurrency(Math.abs(move.change))
  const tone =
    move.direction === 'up'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
      : move.direction === 'down'
        ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-800'
        : 'text-muted-foreground bg-muted/40 border-border'

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
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        tone,
        className
      )}
      title={`${t('market.yesterday')} ${formatCurrency(move.yesterdayPrice)} → ${t('market.today')} ${formatCurrency(move.todayPrice)}`}
    >
      <Icon className="h-3 w-3" />
      {compact ? (
        <span>
          {move.direction === 'up' ? '+' : move.direction === 'down' ? '−' : ''}
          {amount}
        </span>
      ) : (
        <span>{label}</span>
      )}
    </span>
  )
}
