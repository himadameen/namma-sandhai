import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/store/theme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  compact?: boolean
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'cta-interactive inline-flex items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted',
        compact ? 'h-9 w-9' : 'h-9 gap-2 px-3 text-xs font-semibold sm:h-10 sm:px-3.5',
        className
      )}
      aria-label={isDark ? t('theme.light') : t('theme.dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!compact && <span className="hidden sm:inline">{isDark ? t('theme.light') : t('theme.dark')}</span>}
    </button>
  )
}
