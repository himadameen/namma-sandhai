import { useTheme } from '@/store/theme'
import { cn } from '@/lib/utils'

export function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'theme-fab fixed bottom-[max(5.5rem,env(safe-area-inset-bottom))] right-4 z-[55] flex h-12 w-12 items-center justify-center rounded-full border shadow-elevated transition-all duration-300 md:bottom-6 md:right-6',
        isDark
          ? 'border-white/20 bg-white text-[#0c1510] hover:scale-105'
          : 'border-border bg-[#0c1510] text-white hover:scale-105'
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M12 3a9 9 0 1 0 9 9 7.5 7.5 0 0 1-9-9Z"
          className={cn('origin-center transition-transform duration-300', isDark && 'rotate-12 scale-110')}
        />
      </svg>
    </button>
  )
}
