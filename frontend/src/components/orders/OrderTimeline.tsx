import { Check } from 'lucide-react'
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

export function OrderTimeline({ timeline, cancelled }: OrderTimelineProps) {
  const { t } = useTranslation()

  if (cancelled) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {t('orders.cancelled')}
      </div>
    )
  }

  return (
    <ol className="relative flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
      {timeline.map((step, index) => {
        const isLast = index === timeline.length - 1
        return (
          <li key={step.status} className="relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 sm:left-1/2 sm:top-3 sm:h-0.5 sm:w-full sm:-translate-x-1/2',
                  step.completed ? 'bg-secondary' : 'bg-border'
                )}
              />
            )}
            <div
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                step.completed
                  ? 'border-secondary bg-secondary text-white'
                  : step.current
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground'
              )}
            >
              {step.completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </div>
            <div className="pb-6 sm:pb-0 sm:text-center">
              <p
                className={cn(
                  'text-xs font-semibold sm:text-[11px]',
                  step.current ? 'text-primary' : step.completed ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {t(stepLabelKeys[step.status] ?? step.status)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
