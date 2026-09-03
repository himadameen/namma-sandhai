import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type LanguageSwitcherProps = {
  className?: string
  variant?: 'default' | 'dark'
  size?: 'sm' | 'md'
}

export function LanguageSwitcher({
  className,
  variant = 'default',
  size = 'md',
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('ta') ? 'ta' : 'en'
  const isDark = variant === 'dark'

  const setLanguage = (lang: 'en' | 'ta') => {
    i18n.changeLanguage(lang)
    localStorage.setItem('namma-sandhai-language', lang)
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'relative inline-grid grid-cols-2 rounded-full p-0.5',
        size === 'sm' ? 'h-8 w-[4.5rem]' : 'h-9 w-[5.25rem]',
        isDark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-muted ring-1 ring-border/60',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full shadow-sm transition-transform duration-300 ease-out',
          isDark ? 'bg-white text-primary' : 'bg-background text-primary',
          current === 'ta' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0.5'
        )}
      />

      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={current === 'en'}
        aria-label="English"
        className={cn(
          'relative z-10 text-xs font-bold tracking-wide transition-colors',
          size === 'sm' ? 'px-2' : 'px-2.5',
          current === 'en'
            ? isDark
              ? 'text-primary'
              : 'text-primary'
            : isDark
              ? 'text-white/55 hover:text-white/80'
              : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ta')}
        aria-pressed={current === 'ta'}
        aria-label="Tamil"
        className={cn(
          'relative z-10 font-tamil text-xs font-bold tracking-wide transition-colors',
          size === 'sm' ? 'px-2' : 'px-2.5',
          current === 'ta'
            ? isDark
              ? 'text-primary'
              : 'text-primary'
            : isDark
              ? 'text-white/55 hover:text-white/80'
              : 'text-muted-foreground hover:text-foreground'
        )}
      >
        TA
      </button>
    </div>
  )
}
