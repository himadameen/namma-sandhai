import { useTranslation } from 'react-i18next'
import { PlayCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Reveal } from '@/components/landing/Reveal'
import { cn } from '@/lib/utils'

const STEPS = ['demo.step1', 'demo.step2', 'demo.step3', 'demo.step4', 'demo.step5', 'demo.step6'] as const

export function DemoWalkthrough() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <section className="border-t border-border bg-primary/5 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <Card className="border-primary/20 shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <PlayCircle className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle className={cn('text-xl', textClass)}>
                    {t('demo.walkthroughTitle')}
                  </CardTitle>
                  <CardDescription className={textClass}>{t('demo.walkthroughDesc')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {STEPS.map((stepKey, index) => (
                  <Reveal key={stepKey} as="li" variant="left" delay={index * 60} className="flex gap-3 text-sm leading-relaxed">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className={cn('pt-0.5', textClass)}>{t(stepKey)}</span>
                  </Reveal>
                ))}
              </ol>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
