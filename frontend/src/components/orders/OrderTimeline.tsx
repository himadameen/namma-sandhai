import { Check, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { OrderTimelineStep } from '@/api/orders'

interface OrderTimelineProps {
  timeline: OrderTimelineStep[]
  cancelled?: boolean
}

const stepLabelKeys: Record<string, string> = {
  PENDING_CONFIRMATION: 'orders.stepPending',
  CONFIRMED: 'orders.stepConfirmed',
  IN_TRANSIT: 'orders.stepInTransit',
  COMPLETED: 'orders.stepCompleted',
}

const CONFETTI = [
  { className: 'order-confetti-piece bg-accent -left-3 -top-1 rotate-[25deg]', delay: '0ms' },
  { className: 'order-confetti-piece bg-secondary left-7 -top-2 -rotate-12', delay: '80ms' },
  { className: 'order-confetti-piece bg-primary -right-3 top-0 rotate-45', delay: '160ms' },
  { className: 'order-confetti-piece bg-accent right-6 top-2 -rotate-[30deg]', delay: '240ms' },
  { className: 'order-confetti-piece bg-secondary left-1 -bottom-3 rotate-[15deg]', delay: '120ms' },
  { className: 'order-confetti-piece bg-accent right-0 -bottom-2 -rotate-45', delay: '200ms' },
]

const STARS = [
  { className: 'order-star-spark -left-4 -top-3 text-accent', delay: '0ms' },
  { className: 'order-star-spark left-8 -top-4 text-secondary', delay: '100ms' },
  { className: 'order-star-spark -right-4 -top-2 text-accent', delay: '200ms' },
  { className: 'order-star-spark right-7 top-1 text-secondary', delay: '300ms' },
  { className: 'order-star-spark -left-2 bottom-0 text-accent', delay: '150ms' },
  { className: 'order-star-spark right-0 -bottom-1 text-secondary', delay: '250ms' },
]

function OrderStepCelebration() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {CONFETTI.map((piece, index) => (
        <span
          key={`confetti-${index}`}
          className={cn('order-confetti-piece absolute h-1.5 w-2.5 rounded-[1px]', piece.className)}
          style={{ animationDelay: piece.delay }}
        />
      ))}
      {STARS.map((star, index) => (
        <Sparkles
          key={`star-${index}`}
          className={cn('order-star-spark absolute h-3 w-3', star.className)}
          style={{ animationDelay: star.delay }}
        />
      ))}
    </div>
  )
}

export function OrderTimeline({ timeline, cancelled }: OrderTimelineProps) {
  const { t } = useTranslation()

  if (cancelled) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {t('orders.cancelled')}
      </div>
    )
  }

  const segments = Math.max(timeline.length - 1, 1)
  const completedSteps = timeline.filter((step) => step.completed).length
  const completedSegments = Math.max(0, Math.min(completedSteps - 1, segments))
  const progressPercent = (completedSegments / segments) * 100
  const isFullyComplete = timeline.every((step) => step.completed)

  return (
    <div className="relative py-1">
      {/* Mobile — vertical progress track */}
      <div
        aria-hidden
        className="absolute bottom-4 left-3 top-3 w-0.5 overflow-hidden rounded-full bg-border sm:hidden"
      >
        <div
          className="w-full rounded-full bg-secondary transition-all duration-700 ease-out"
          style={{ height: `${progressPercent}%` }}
        />
      </div>

      {/* Desktop — horizontal progress track (first node center → last node center) */}
      <div
        aria-hidden
        className="absolute left-[12.5%] right-[12.5%] top-3 hidden h-0.5 overflow-hidden rounded-full bg-border sm:block"
      >
        <div
          className="h-full rounded-full bg-secondary transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ol className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between">
        {timeline.map((step, index) => {
          const isCompletedStep = step.status === 'COMPLETED' && isFullyComplete

          return (
            <li
              key={step.status}
              className="relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2"
            >
              <div className="relative flex shrink-0 items-center justify-center">
                {isCompletedStep && <OrderStepCelebration />}
                <div
                  className={cn(
                    'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300',
                    step.completed
                      ? 'border-secondary bg-secondary text-white'
                      : step.current
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground',
                    isCompletedStep && 'order-step-complete-ring scale-110 shadow-md'
                  )}
                >
                  {step.completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
              </div>
              <div className={cn('pb-6 sm:pb-0 sm:text-center', index === timeline.length - 1 && 'pb-0')}>
                <p
                  className={cn(
                    'text-xs font-semibold sm:text-[11px]',
                    isCompletedStep
                      ? 'text-secondary'
                      : step.current
                        ? 'text-primary'
                        : step.completed
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                  )}
                >
                  {t(stepLabelKeys[step.status] ?? step.status)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
