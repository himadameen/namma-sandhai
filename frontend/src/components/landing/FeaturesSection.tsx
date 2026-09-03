import { useTranslation } from 'react-i18next'
import { BarChart3, Check, Download, FileSpreadsheet, TrendingUp } from 'lucide-react'
import { SectionBackground } from '@/components/landing/SectionBackground'
import { Reveal } from '@/components/landing/Reveal'
import { cn } from '@/lib/utils'

const marketFeatures = ['landing.marketFeature1', 'landing.marketFeature2', 'landing.marketFeature3'] as const
const recordFeatures = ['landing.recordsFeature1', 'landing.recordsFeature2', 'landing.recordsFeature3'] as const

const chartBars = [42, 38, 40, 36, 39, 41, 42]

const ledgerRows = [
  { labelKey: 'landing.featuresMockSale1', amount: '₹8,400', date: '02 Sep' },
  { labelKey: 'landing.featuresMockSale2', amount: '₹3,750', date: '28 Aug' },
  { labelKey: 'landing.featuresMockSale3', amount: '₹2,160', date: '22 Aug' },
] as const

function FeatureChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/[0.04] px-3 py-1.5 text-xs font-medium text-foreground/85',
        className
      )}
    >
      <Check className="h-3 w-3 shrink-0 text-secondary" aria-hidden />
      {children}
    </span>
  )
}

function MockPriceChart({ textClass }: { textClass: string }) {
  const { t } = useTranslation()
  const max = Math.max(...chartBars)

  return (
    <div className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-xs font-semibold text-muted-foreground', textClass)}>
          {t('landing.featuresMockTrend')}
        </p>
        <span className={cn('rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-foreground', textClass)}>
          {t('landing.featuresMockCrop')}
        </span>
      </div>

      <div className="mt-4 flex h-24 items-end justify-between gap-1.5">
        {chartBars.map((value, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                'w-full rounded-t-md transition-all duration-500',
                i === chartBars.length - 1 ? 'bg-primary' : 'bg-primary/25'
              )}
              style={{ height: `${(value / max) * 100}%` }}
            />
            <span className="text-[9px] text-muted-foreground">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-primary/5 px-3 py-2">
          <p className={cn('text-[10px] text-muted-foreground', textClass)}>
            {t('landing.featuresMockYourPrice')}
          </p>
          <p className="text-lg font-bold text-primary">₹42</p>
        </div>
        <div className="rounded-xl bg-secondary/5 px-3 py-2">
          <p className={cn('text-[10px] text-muted-foreground', textClass)}>
            {t('landing.featuresMockMarketAvg')}
          </p>
          <p className="flex items-center gap-1 text-lg font-bold text-secondary">
            ₹38
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          </p>
        </div>
      </div>
    </div>
  )
}

function MockLedger({ textClass }: { textClass: string }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-xs font-semibold text-muted-foreground', textClass)}>
          {t('landing.featuresMockLedger')}
        </p>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border border-secondary/20 bg-secondary/5 px-2.5 py-1 text-[10px] font-semibold text-secondary',
            textClass
          )}
        >
          <Download className="h-3 w-3" aria-hidden />
          {t('landing.featuresMockExport')}
        </span>
      </div>

      <ul className="mt-3 divide-y divide-border/60">
        {ledgerRows.map((row) => (
          <li key={row.labelKey} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className={cn('truncate text-sm font-medium text-foreground', textClass)}>
                {t(row.labelKey)}
              </p>
              <p className="text-[10px] text-muted-foreground">{row.date}</p>
            </div>
            <span className="shrink-0 text-sm font-bold text-primary">{row.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FeaturesSection() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <SectionBackground id="features" variant="waves" tone="default" className="py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="fade" className="mx-auto max-w-2xl text-center">
          <h2 className={cn('text-2xl font-bold text-primary sm:text-3xl', textClass)}>
            {t('landing.featuresTitle')}
          </h2>
          <p className={cn('mt-3 text-muted-foreground', textClass)}>{t('landing.featuresSub')}</p>
        </Reveal>

        <div className="mt-10 space-y-5">
          {/* Market intelligence — horizontal band */}
          <Reveal variant="left" delay={80}>
            <div className="overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] via-background to-background p-6 sm:p-8">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15">
                      <BarChart3 className="h-5 w-5 text-accent" />
                    </span>
                    <h3 className={cn('text-xl font-bold text-primary', textClass)}>
                      {t('landing.marketIntelligence')}
                    </h3>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {marketFeatures.map((key) => (
                      <FeatureChip key={key} className={textClass}>
                        {t(key)}
                      </FeatureChip>
                    ))}
                  </div>
                </div>
                <MockPriceChart textClass={textClass} />
              </div>
            </div>
          </Reveal>

          {/* Digital records — horizontal band (reversed) */}
          <Reveal variant="right" delay={120}>
            <div className="overflow-hidden rounded-3xl border border-secondary/20 bg-gradient-to-bl from-secondary/[0.06] via-background to-background p-6 sm:p-8">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div className="order-2 lg:order-1">
                  <MockLedger textClass={textClass} />
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/15">
                      <FileSpreadsheet className="h-5 w-5 text-secondary" />
                    </span>
                    <h3 className={cn('text-xl font-bold text-primary', textClass)}>
                      {t('landing.digitalRecords')}
                    </h3>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {recordFeatures.map((key) => (
                      <FeatureChip key={key} className={textClass}>
                        {t(key)}
                      </FeatureChip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionBackground>
  )
}
