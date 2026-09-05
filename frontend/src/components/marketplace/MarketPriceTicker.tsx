import { Activity } from 'lucide-react'
import type { DailyPriceMove } from '@/api/listings'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { useLocaleText } from '@/hooks/useLocaleText'
import { PriceMoveChip } from '@/components/marketplace/PriceMoveChip'
import { cn } from '@/lib/utils'

export function MarketPriceTicker({ moves }: { moves: DailyPriceMove[] }) {
  const { t, isTamil, textClass } = useLocaleText()
  if (!moves.length) return null

  const items = [...moves, ...moves]

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-2">
        <Activity className="h-4 w-4 text-primary" />
        <p className={cn('text-sm font-bold', textClass)}>{t('market.tickerTitle')}</p>
        <p className="text-xs text-muted-foreground">{t('market.yesterday')} → {t('market.today')}</p>
      </div>
      <div className="relative overflow-hidden py-2.5">
        <div className="market-ticker-track flex w-max gap-6 px-4">
          {items.map((move, index) => {
            const cropName = isTamil ? move.cropNameTamil : move.cropName
            return (
              <div key={`${move.cropId}-${move.district}-${index}`} className="flex shrink-0 items-center gap-2">
                <span className={cn('text-sm font-semibold', textClass)}>
                  {getCropEmoji(move.cropName)} {cropName}
                </span>
                <span className="text-xs text-muted-foreground">{move.district}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(move.yesterdayPrice)}
                  <span className="mx-1">→</span>
                  {formatCurrency(move.todayPrice)}/{move.unit}
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
