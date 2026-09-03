import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeroTagline } from '@/components/landing/HeroTagline'
import { HeroVisual } from '@/components/landing/HeroVisual'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { AudienceSection } from '@/components/landing/AudienceSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { SectionBackground } from '@/components/landing/SectionBackground'
import { Reveal, RevealGroup } from '@/components/landing/Reveal'
import { Logo } from '@/components/brand/Logo'
import { LogoWatermark } from '@/components/brand/LogoWatermark'
import { ImageWithFallback, PlaceholderFrame } from '@/components/ui/ImageWithFallback'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { useInView } from '@/hooks/useInView'
import {
  galleryImages,
} from '@/constants/landingImages'
import { cn } from '@/lib/utils'

const stats = [
  { value: '12,480+', labelKey: 'landing.statFarmers' },
  { value: '₹2.4 Cr', labelKey: 'landing.statProduce' },
  { value: '18', labelKey: 'landing.statDistricts' },
]

function StatCard({
  value,
  labelKey,
  animate,
  delay,
}: {
  value: string
  labelKey: string
  animate: boolean
  delay: number
}) {
  const { t } = useTranslation()
  const display = useAnimatedCounter(value, 1400, animate)

  return (
    <div className="hero-enter" style={{ animationDelay: `${delay}ms` }}>
      <Card className="group text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
        <CardContent className="p-3 sm:p-4">
          <p className="text-lg font-bold text-primary sm:text-2xl">{display}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-sm">{t(labelKey)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function LandingPage() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  const heroStats = useInView<HTMLDivElement>(0.3)

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/6" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23164A35' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Left — copy */}
            <div className="text-center lg:text-left">
              <div className="hero-enter flex justify-center lg:justify-start" style={{ animationDelay: '0ms' }}>
                <Logo
                  size="hero"
                  tamilMode={isTamil}
                  className="mb-4 origin-center scale-90 sm:mb-6 sm:scale-100 lg:origin-left"
                />
              </div>

              <div className="hero-enter mx-auto max-w-lg lg:mx-0" style={{ animationDelay: '80ms' }}>
                <HeroTagline className="mb-4 sm:mb-5" />
              </div>

              <h1
                className={cn(
                  'hero-enter whitespace-pre-line text-2xl font-extrabold leading-tight text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]',
                  textClass
                )}
                style={{ animationDelay: '160ms' }}
              >
                {t('landing.heroTitle')}
              </h1>

              <p
                className={cn(
                  'hero-enter mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:mx-0',
                  textClass
                )}
                style={{ animationDelay: '240ms' }}
              >
                {t('landing.heroDescription')}
              </p>

              <div
                className="hero-enter mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:gap-3 lg:mx-0"
                style={{ animationDelay: '320ms' }}
              >
                <Button size="xl" className={cn('w-full sm:w-auto', textClass)} asChild>
                  <Link to="/register?role=farmer">
                    {t('landing.iAmFarmer')}
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="secondary" className={cn('w-full sm:w-auto', textClass)} asChild>
                  <Link to="/register?role=buyer">
                    {t('landing.iAmBuyer')}
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div
                className="hero-enter mt-6 flex flex-wrap justify-center gap-4 sm:mt-8 sm:gap-5 lg:justify-start"
                style={{ animationDelay: '400ms' }}
              >
                <Link
                  to="/marketplace"
                  className={cn(
                    'group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                    textClass
                  )}
                >
                  {t('common.searchProduce')}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className={cn(
                    'group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                    textClass
                  )}
                >
                  {t('nav.howItWorks')}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

            {/* Right — hero image + stats */}
            <div className="relative">
              <HeroVisual
                tamilMode={isTamil}
                className="hero-enter-right landing-float"
                style={{ animationDelay: '200ms' }}
              />

              <div ref={heroStats.ref} className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-4">
                {stats.map((stat, i) => (
                  <StatCard
                    key={stat.labelKey}
                    value={stat.value}
                    labelKey={stat.labelKey}
                    animate={heroStats.inView}
                    delay={500 + i * 100}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery strip ── */}
      <SectionBackground id="gallery" variant="grain" tone="card" className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up" className="text-center">
            <h2 className={cn('text-2xl font-bold text-primary sm:text-3xl', textClass)}>
              {t('landing.galleryTitle')}
            </h2>
            <p className={cn('mx-auto mt-3 max-w-2xl text-muted-foreground', textClass)}>
              {t('landing.gallerySub')}
            </p>
          </Reveal>

          <RevealGroup
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
            stagger={120}
            variant="scale"
          >
            {galleryImages.map((item) => (
              <div
                key={item.altKey}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card"
              >
                <ImageWithFallback
                  src={item.src}
                  alt={t(item.altKey)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  fallback={
                    <PlaceholderFrame gradient="crop" className="h-full">
                      <LogoWatermark tamilMode={isTamil} size="sm" />
                    </PlaceholderFrame>
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                <p
                  className={cn(
                    'absolute bottom-3 left-3 right-3 text-sm font-semibold text-white',
                    textClass
                  )}
                >
                  {t(item.altKey)}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </SectionBackground>

      <HowItWorksSection />

      <AudienceSection />

      <FeaturesSection />

      {/* ── CTA ── */}
      <SectionBackground variant="dots" tone="primary" className="py-14 sm:py-20">
        <Reveal variant="scale" className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Logo size="lg" tamilMode={isTamil} className="mx-auto mb-6 sm:mb-8" />
          <h2 className={cn('text-2xl font-bold text-primary sm:text-4xl', textClass)}>
            {t('landing.ctaTitle')}
          </h2>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Button size="xl" className={cn('w-full sm:w-auto', textClass)} asChild>
              <Link to="/register">{t('landing.ctaButton')}</Link>
            </Button>
            <Button size="xl" variant="outline" className={cn('w-full sm:w-auto', textClass)} asChild>
              <Link to="/marketplace">{t('common.searchProduce')}</Link>
            </Button>
          </div>
        </Reveal>
      </SectionBackground>
    </div>
  )
}
