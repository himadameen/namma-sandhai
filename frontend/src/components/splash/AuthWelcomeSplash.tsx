import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogoMark } from '@/components/brand/LogoMark'
import { SplashVectors } from '@/components/splash/SplashVectors'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/types'
import { cn } from '@/lib/utils'

const WELCOME_DURATION_MS = 3600
const EXIT_MS = 550

export type AuthWelcomeMode = 'login' | 'register'

interface AuthWelcomeSplashProps {
  mode: AuthWelcomeMode
  userName: string
  role: UserRole
  onComplete: () => void
}

function roleLabelKey(role: UserRole): string {
  switch (role) {
    case 'FARMER':
      return 'authWelcome.roleFarmer'
    case 'BUYER':
      return 'authWelcome.roleBuyer'
    case 'ADMIN':
      return 'authWelcome.roleAdmin'
    default:
      return 'authWelcome.roleFarmer'
  }
}

export function AuthWelcomeSplash({ mode, userName, role, onComplete }: AuthWelcomeSplashProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter')
  const completedRef = useRef(false)

  useEffect(() => {
    const finish = () => {
      if (completedRef.current) return
      completedRef.current = true
      onComplete()
    }

    const holdTimer = window.setTimeout(() => setPhase('exit'), WELCOME_DURATION_MS - EXIT_MS)
    const exitTimer = window.setTimeout(finish, WELCOME_DURATION_MS)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(exitTimer)
    }
  }, [onComplete])

  const titleKey = mode === 'login' ? 'authWelcome.loginTitle' : 'authWelcome.registerTitle'
  const subKey = mode === 'login' ? 'authWelcome.loginSub' : 'authWelcome.registerSub'

  return (
    <div
      className={cn(
        'splash-screen fixed inset-0 z-[250] flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-[max(22vh,128px)] pt-[max(1rem,env(safe-area-inset-top))]',
        phase === 'exit' && 'splash-screen-exit'
      )}
      role="dialog"
      aria-live="polite"
      aria-label={t(titleKey)}
    >
      <SplashVectors />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <div className="splash-stage-enter relative mx-auto">
          <div className="splash-logo-card relative rounded-2xl border border-primary/10 bg-card/90 px-6 py-6 shadow-elevated backdrop-blur-md sm:rounded-3xl sm:px-10 sm:py-8">
            <div className="splash-logo-enter flex flex-col items-center text-center">
              <LogoMark size="lg" className="splash-mark-pulse sm:hidden" />
              <LogoMark size="hero" className="splash-mark-pulse hidden sm:block" />

              <Badge variant="muted" className={cn('mt-4', textClass)}>
                {t(roleLabelKey(role))}
              </Badge>

              <h1 className={cn('mt-4 text-xl font-bold text-primary sm:text-2xl', textClass)}>
                {t(titleKey)}
              </h1>

              <p className={cn('mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base', textClass)}>
                {t(subKey, { name: userName })}
              </p>

              <p
                className={cn(
                  'splash-tagline-mobile mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary sm:text-sm',
                  textClass
                )}
              >
                {t('authWelcome.redirecting')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
