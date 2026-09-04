import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropdownSelectOption<T extends string | number> {
  value: T
  label: string
}

interface DropdownSelectProps<T extends string | number> {
  value: T
  options: DropdownSelectOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
  align?: 'left' | 'right'
  fullWidth?: boolean
  disabled?: boolean
}

export function DropdownSelect<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  align = 'right',
  fullWidth = false,
  disabled = false,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', fullWidth ? 'block w-full' : 'inline-block', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50',
          fullWidth ? 'h-11 w-full min-w-0' : 'h-9 min-w-[7.5rem]'
        )}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            'absolute top-[calc(100%+0.35rem)] z-50 max-h-60 min-w-full overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-elevated',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={String(option.value)} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60',
                    isSelected && 'bg-primary/8 font-semibold text-primary'
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
