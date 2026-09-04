import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  limitOptions?: number[]
  labels: {
    pageSize: string
    showing: string
    previous: string
    next: string
    pageOf: string
    perPageOption: (count: number) => string
  }
  className?: string
}

export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20],
  labels,
  className,
}: PaginationControlsProps) {
  if (total === 0) return null

  const pageSizeOptions = limitOptions.map((option) => ({
    value: option,
    label: labels.perPageOption(option),
  }))

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between',
        className
      )}
    >
      <p className="text-sm leading-relaxed text-muted-foreground">{labels.showing}</p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-muted-foreground">{labels.pageSize}</span>
          <DropdownSelect
            value={limit}
            options={pageSizeOptions}
            onChange={(nextLimit) => {
              onLimitChange(nextLimit)
              onPageChange(1)
            }}
            ariaLabel={labels.pageSize}
            align="right"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/20 p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={labels.previous}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[6.5rem] px-2 text-center text-sm font-semibold tabular-nums text-foreground">
            {labels.pageOf}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={labels.next}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
