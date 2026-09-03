import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/landing/Reveal'
import { SectionBackground } from '@/components/landing/SectionBackground'
import { LogoWatermark } from '@/components/brand/LogoWatermark'
import { ImageWithFallback, PlaceholderFrame } from '@/components/ui/ImageWithFallback'
import { landingImages } from '@/constants/landingImages'
import { cn } from '@/lib/utils'

const farmerFeatures: { key: string; icon: LucideIcon }[] = [
  { key: 'landing.farmerFeature1', icon: BarChart3 },
  { key: 'landing.farmerFeature2', icon: Users },
  { key: 'landing.farmerFeature3', icon: FileSpreadsheet },
]

const buyerFeatures: { key: string; icon: LucideIcon }[] = [
  { key: 'landing.buyerFeature1', icon: Search },
  { key: 'landing.buyerFeature2', icon: ShieldCheck },
  { key: 'landing.buyerFeature3', icon: Truck },
]

function FeaturePill({
  label,
  icon: Icon,
  accent,
  textClass,
}: {
  label: string
  icon: LucideIcon
  accent: 'primary' | 'secondary'
  textClass: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium sm:text-sm',
        accent === 'primary'
          ? 'border-primary/15 bg-primary/[0.05] text-primary'
          : 'border-secondary/15 bg-secondary/[0.05] text-secondary',
        textClass
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  )
}

function AudienceRow({
  role,
  titleKey,
  subKey,
  features,
  image,
  ctaKey,
  registerRole,
  isTamil,
  textClass,
  imageFirst,
  delay,
}: {
  role: 'farmer' | 'buyer'
  titleKey: string
  subKey: string
  features: { key: string; icon: LucideIcon }[]
  image: string
  ctaKey: string
  registerRole: 'farmer' | 'buyer'
  isTamil: boolean
  textClass: string
  imageFirst?: boolean
  delay?: number
}) {
  const { t } = useTranslation()
  const isFarmer = role === 'farmer'
  const RoleIcon = isFarmer ? Sprout : ShoppingBag
  const accent = isFarmer ? 'primary' : 'secondary'

  const imageBlock = (
    <div className="group relative min-h-[240px] overflow-hidden sm:min-h-[280px] lg:min-h-[320px]">
      <ImageWithFallback
        src={image}
        alt={t(titleKey)}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        fallback={
          <PlaceholderFrame gradient={isFarmer ? 'portrait' : 'crop'} className="h-full min-h-[240px]">
            <LogoWatermark tamilMode={isTamil} size="sm" />
          </PlaceholderFrame>
        }
      />
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t opacity-60',
          isFarmer ? 'from-primary/80 to-transparent' : 'from-secondary/80 to-transparent'
        )}
      />
      <span
        className={cn(
          'absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm',
          isFarmer ? 'bg-primary/70' : 'bg-secondary/70'
        )}
      >
        <RoleIcon className="h-3.5 w-3.5" aria-hidden />
        {t(titleKey)}
      </span>
    </div>
  )

  const copyBlock = (
    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
      <h3 className={cn('text-2xl font-bold text-primary sm:text-[1.65rem]', textClass)}>
        {t(titleKey)}
      </h3>
      <p className={cn('mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base', textClass)}>
        {t(subKey)}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {features.map(({ key, icon }) => (
          <FeaturePill
            key={key}
            label={t(key)}
            icon={icon}
            accent={accent}
            textClass={textClass}
          />
        ))}
      </div>

      <Button
        className={cn('mt-7 w-fit', textClass)}
        variant={isFarmer ? 'default' : 'secondary'}
        size="lg"
        asChild
      >
        <Link to={`/register?role=${registerRole}`}>
          {t(ctaKey)}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )

  return (
    <Reveal variant={imageFirst ? 'left' : 'right'} delay={delay}>
      <article
        className={cn(
          'audience-row overflow-hidden rounded-3xl border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover',
          isFarmer ? 'border-primary/12' : 'border-secondary/12'
        )}
      >
        <div className={cn('grid lg:grid-cols-2', !imageFirst && 'lg:[&>*:first-child]:order-2')}>
          {imageFirst ? (
            <>
              {imageBlock}
              {copyBlock}
            </>
          ) : (
            <>
              {copyBlock}
              {imageBlock}
            </>
          )}
        </div>
      </article>
    </Reveal>
  )
}

export function AudienceSection() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <SectionBackground variant="mesh" tone="muted" className="py-12 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up" className="text-center">
          <span
            className={cn(
              'inline-flex rounded-full border border-primary/15 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary',
              textClass
            )}
          >
            {t('landing.audienceTitle')}
          </span>
          <h2 className={cn('mt-4 text-2xl font-bold text-primary sm:text-3xl', textClass)}>
            {t('landing.flowSummary')}
          </h2>
        </Reveal>

        <div className="relative mt-12 space-y-8">
          <AudienceRow
            role="farmer"
            titleKey="landing.forFarmers"
            subKey="landing.farmersSub"
            features={farmerFeatures}
            image={landingImages.farmerPortrait}
            ctaKey="landing.iAmFarmer"
            registerRole="farmer"
            isTamil={isTamil}
            textClass={textClass}
            imageFirst
            delay={80}
          />

          {/* Center connector */}
          <div className="relative flex justify-center py-1" aria-hidden>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <Reveal variant="scale" delay={140}>
              <span
                className={cn(
                  'relative z-10 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm',
                  textClass
                )}
              >
                <Sprout className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary">→</span>
                <ShoppingBag className="h-3.5 w-3.5 text-secondary" />
              </span>
            </Reveal>
          </div>

          <AudienceRow
            role="buyer"
            titleKey="landing.forBuyers"
            subKey="landing.buyersSub"
            features={buyerFeatures}
            image={landingImages.buyerMarket}
            ctaKey="landing.iAmBuyer"
            registerRole="buyer"
            isTamil={isTamil}
            textClass={textClass}
            delay={180}
          />
        </div>
      </div>
    </SectionBackground>
  )
}
