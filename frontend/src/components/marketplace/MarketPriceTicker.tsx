import { useMemo } from 'react'
import { Activity, PauseCircle } from 'lucide-react'
import type { DailyPriceMove } from '@/api/listings'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { useLocaleText } from '@/hooks/useLocaleText'
import { PriceMoveChip } from '@/components/marketplace/PriceMoveChip'
import { cn } from '@/lib/utils'

export function MarketPriceTicker({ moves }: { moves: DailyPriceMove[] }) {
  const { t, isTamil, textClass } = useLocaleText()

  const featuredMoves = useMemo(() => {
    if (!moves.length) return []
    // Pick unique crops so all different crops are featured without repetitive duplicates
    const seen = new Set<string>()
    const list: DailyPriceMove[] = []
    for (const move of moves) {
      if (!seen.has(move.cropId)) {
        seen.add(move.cropId)
        list.push(move)
      }
    }
    return list.length > 0 ? list : moves.slice(0, 15)
  }, [moves])

  if (!featuredMoves.length) return null

  const items = [...featuredMoves, ...featuredMoves]

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
        <div className="flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-primary" />
          <p className={cn('text-sm font-bold', textClass)}>{t('market.tickerTitle')}</p>
          <span className="text-border">·</span>
          <p className="text-xs text-muted-foreground">{t('market.yesterday')} → {t('market.today')}</p>
        </div>
        <span className="hidden items-center gap-1 text-[11px] text-muted-foreground/75 sm:inline-flex">
          <PauseCircle className="h-3 w-3 text-muted-foreground/60" />
          {t('market.hoverToPause')}
        </span>
      </div>

      <div className="market-ticker-container relative overflow-hidden py-3">
        <div className="market-ticker-track flex w-max gap-4 px-4 cursor-default">
          {items.map((move, index) => {
            const cropName = isTamil ? move.cropNameTamil : move.cropName
            return (
              <div
                key={`${move.cropId}-${move.district}-${index}`}
                className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border/70 bg-background/80 px-3 py-1.5 shadow-xs transition-colors hover:border-primary/40 hover:bg-background"
              >
                <span className={cn('text-sm font-semibold', textClass)}>
                  {getCropEmoji(move.cropName)} {cropName}
                </span>
                <span className="text-xs text-muted-foreground">{move.district}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">{formatCurrency(move.yesterdayPrice)}</span>
                  <span className="mx-1 text-muted-foreground/60">→</span>
                  <span className="font-semibold text-foreground">{formatCurrency(move.todayPrice)}</span>/{move.unit}
                </span>
                <PriceMoveChip move={move} compact />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
