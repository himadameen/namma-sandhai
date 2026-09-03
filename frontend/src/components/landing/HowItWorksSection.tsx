import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Sprout,
  TrendingUp,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/landing/Reveal'
import { SectionBackground } from '@/components/landing/SectionBackground'
import { cn } from '@/lib/utils'

const steps: {
  num: string
  titleKey: string
  descKey: string
  hintKey: string
  icon: LucideIcon
}[] = [
  {
    num: '01',
    titleKey: 'landing.step1Title',
    descKey: 'landing.step1Desc',
    hintKey: 'landing.step1Hint',
    icon: Sprout,
  },
  {
    num: '02',
    titleKey: 'landing.step2Title',
    descKey: 'landing.step2Desc',
    hintKey: 'landing.step2Hint',
    icon: TrendingUp,
  },
  {
    num: '03',
    titleKey: 'landing.step3Title',
    descKey: 'landing.step3Desc',
    hintKey: 'landing.step3Hint',
    icon: Users,
  },
  {
    num: '04',
    titleKey: 'landing.step4Title',
    descKey: 'landing.step4Desc',
    hintKey: 'landing.step4Hint',
    icon: Truck,
  },
]

function TimelineStep({
  step,
  index,
  textClass,
}: {
  step: (typeof steps)[number]
  index: number
  textClass: string
}) {
  const { t } = useTranslation()
  const Icon = step.icon
  const isLeft = index % 2 === 0

  const card = (
    <div
      className={cn(
        'max-w-md rounded-2xl border border-border/80 bg-card/90 p-5 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-card-hover',
        isLeft ? 'md:ml-auto md:text-right' : 'md:mr-auto md:text-left'
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary',
          textClass
        )}
      >
        {t('landing.howItWorks')} · {step.num}
      </span>
      <h3 className={cn('mt-3 text-lg font-bold text-primary', textClass)}>{t(step.titleKey)}</h3>
      <p className={cn('mt-2 text-sm leading-relaxed text-muted-foreground', textClass)}>
        {t(step.descKey)}
      </p>
      <p
        className={cn(
          'mt-3 inline-flex rounded-lg border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-foreground',
          textClass
        )}
      >
        {t(step.hintKey)}
      </p>
    </div>
  )

  return (
    <li className="relative flex flex-col gap-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8">
      {/* Mobile stack */}
      <div className="md:hidden">
        <Reveal variant="up" delay={index * 80}>
          {card}
        </Reveal>
      </div>

      {/* Desktop left column */}
      {isLeft ? (
        <div className="hidden md:px-2 md:block">
          <Reveal variant="left" delay={index * 80}>
            {card}
          </Reveal>
        </div>
      ) : (
        <div className="hidden md:block" aria-hidden />
      )}

      <div className="relative z-10 flex justify-center">
        <Reveal variant="scale" delay={index * 80 + 40}>
          <div className="timeline-node flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/20 bg-card shadow-elevated">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </Reveal>
      </div>

      {/* Desktop right column */}
      {!isLeft ? (
        <div className="hidden md:px-2 md:block">
          <Reveal variant="right" delay={index * 80}>
            {card}
          </Reveal>
        </div>
      ) : (
        <div className="hidden md:block" aria-hidden />
      )}
    </li>
  )
}

export function HowItWorksSection() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <SectionBackground
      id="how-it-works"
      variant="diagonal"
      tone="primary"
      className="py-12 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up" className="text-center">
          <span
            className={cn(
              'inline-flex rounded-full border border-primary/15 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary',
              textClass
            )}
          >
            {t('landing.howItWorks')}
          </span>
          <h2 className={cn('mt-4 text-2xl font-bold text-primary sm:text-3xl', textClass)}>
            {t('landing.howItWorksSub')}
          </h2>
          <p className={cn('mx-auto mt-3 max-w-xl text-muted-foreground', textClass)}>
            {t('landing.flowSummary')}
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* Animated vertical spine */}
          <div
            className="timeline-spine absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-border md:block"
            aria-hidden
          />

          <ul className="relative space-y-10 md:space-y-14">
            {steps.map((step, index) => (
              <TimelineStep key={step.num} step={step} index={index} textClass={textClass} />
            ))}
          </ul>
        </div>

        <Reveal variant="up" delay={200} className="mt-12 text-center">
          <Button size="lg" className={textClass} asChild>
            <Link to="/register">
              {t('landing.ctaButton')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </SectionBackground>
  )
}
