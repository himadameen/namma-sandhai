import { useEffect, useRef, useState } from 'react'
import { LogoMark } from '@/components/brand/LogoMark'
import { SplashVectors } from '@/components/splash/SplashVectors'
import { cn } from '@/lib/utils'

const TAGLINE = 'The right price for every harvest.'
const SPLASH_DURATION_MS = 5000
const EXIT_MS = 700

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter')
  const completedRef = useRef(false)

  useEffect(() => {
    const finish = () => {
      if (completedRef.current) return
      completedRef.current = true
      onComplete()
    }

    const holdTimer = window.setTimeout(() => setPhase('exit'), SPLASH_DURATION_MS - EXIT_MS)
    const exitTimer = window.setTimeout(finish, SPLASH_DURATION_MS)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(exitTimer)
    }
  }, [onComplete])

  return (
    <div
      className={cn(
        'splash-screen fixed inset-0 z-[200] flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-[max(26vh,148px)] pt-[max(1rem,env(safe-area-inset-top))]',
        phase === 'exit' && 'splash-screen-exit'
      )}
      role="dialog"
      aria-label="Namma Sandhai welcome"
    >
      <SplashVectors />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <div className="splash-stage-enter relative mx-auto">
          <div className="splash-ring splash-ring-1 absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block" aria-hidden />
          <div className="splash-ring splash-ring-2 absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block" aria-hidden />

          <div className="splash-logo-card relative rounded-2xl border border-primary/10 bg-card/85 px-6 py-6 shadow-elevated backdrop-blur-md sm:rounded-3xl sm:px-10 sm:py-8">
            <div className="splash-logo-enter flex flex-col items-center">
              <LogoMark size="lg" className="splash-mark-pulse sm:hidden" />
              <LogoMark size="hero" className="splash-mark-pulse hidden sm:block" />

              <div className="mt-3 text-center sm:mt-4">
                <p className="font-tamil text-3xl font-bold text-primary sm:text-5xl">நம்ம</p>
                <p className="mt-0.5 font-sans text-sm font-extrabold tracking-[0.24em] text-secondary sm:mt-1 sm:text-lg sm:tracking-[0.28em]">
                  SANDHAI
                </p>
              </div>

              {/* Mobile tagline — compact single block */}
              <p
                className={cn(
                  'splash-tagline-mobile mt-4 text-center text-[11px] font-bold italic leading-relaxed text-primary/90 sm:hidden',
                  'capitalize'
                )}
              >
                <span className="mr-0.5 font-serif text-lg leading-none text-primary/25">&ldquo;</span>
                {TAGLINE}
                <span className="ml-0.5 font-serif text-lg leading-none text-primary/25">&rdquo;</span>
              </p>

              {/* Tablet+ tagline — word reveal */}
              <blockquote className="splash-tagline-banner mt-5 hidden w-full items-center justify-between gap-2 sm:flex sm:gap-3">
                <span
                  className="splash-tagline-quote splash-tagline-quote-open shrink-0 font-serif text-4xl font-bold leading-none text-primary/30 md:text-5xl"
                  aria-hidden
                >
                  &ldquo;
                </span>

                <p className="flex flex-1 flex-wrap justify-center gap-x-1.5 gap-y-0.5 md:gap-x-2">
                  {TAGLINE.replace(/\.$/, '')
                    .split(' ')
                    .map((word, i) => (
                      <span
                        key={`${word}-${i}`}
                        className="splash-tagline-word text-xs font-bold italic capitalize text-primary/90 md:text-sm"
                      >
                        {word}
                      </span>
                    ))}
                  <span className="splash-tagline-word text-xs font-bold italic text-primary/90 md:text-sm">.</span>
                </p>

                <span
                  className="splash-tagline-quote splash-tagline-quote-close shrink-0 font-serif text-4xl font-bold leading-none text-primary/30 md:text-5xl"
                  aria-hidden
                >
                  &rdquo;
                </span>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      <div className="splash-strip-enter absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 px-4 sm:bottom-8">
        <div className="mx-auto flex max-w-xs flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:max-w-none sm:gap-x-0">
          {['Tamil Nadu', 'Farmers', 'Fair Trade'].map((label, i) => (
            <span key={label} className="flex items-center gap-3 sm:gap-0">
              {i > 0 && (
                <span className="h-1 w-1 rounded-full bg-primary/30 sm:mr-8 sm:block md:mr-10" aria-hidden />
              )}
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary/45 sm:text-xs sm:tracking-[0.22em]">
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export const SPLASH_SESSION_KEY = 'namma-splash-seen'

export function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  if (sessionStorage.getItem(SPLASH_SESSION_KEY)) return false
  const path = window.location.pathname
  return path === '/' || path === ''
}
