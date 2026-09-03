import { cn } from '@/lib/utils'

const selectClassName =
  'flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(selectClassName, className)} {...props}>
      {children}
    </select>
  )
}

export { selectClassName }
