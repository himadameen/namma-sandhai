import { Leaf, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LogoWatermark } from '@/components/brand/LogoWatermark'
import { ImageWithFallback, PlaceholderFrame } from '@/components/ui/ImageWithFallback'
import { landingImages } from '@/constants/landingImages'
import { cn } from '@/lib/utils'

interface HeroVisualProps {
  tamilMode?: boolean
  className?: string
  style?: React.CSSProperties
}

export function HeroVisual({ tamilMode = false, className, style }: HeroVisualProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  const heroFallback = (
    <PlaceholderFrame gradient="hero" className="absolute inset-0">
      <LogoWatermark tamilMode={tamilMode} size="lg" />
      <Sprout className="absolute bottom-24 right-8 h-16 w-16 text-white/15" aria-hidden />
      <Sprout className="absolute left-8 top-16 h-10 w-10 text-white/10" aria-hidden />
    </PlaceholderFrame>
  )

  const farmerFallback = (
    <PlaceholderFrame gradient="portrait" className="h-full w-full">
      <LogoWatermark tamilMode={tamilMode} size="sm" />
    </PlaceholderFrame>
  )

  return (
    <div
      className={cn('relative aspect-[4/3] overflow-hidden rounded-3xl shadow-elevated', className)}
      style={style}
    >
      <ImageWithFallback
        src={landingImages.hero}
        alt={t('landing.heroBadge')}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fallback={heroFallback}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-primary/5" />

      <div className="absolute right-4 top-4 hidden w-28 overflow-hidden rounded-2xl border-2 border-white/40 shadow-elevated sm:block">
        <div className="relative h-32">
          <ImageWithFallback
            src={landingImages.heroFarmer}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fallback={farmerFallback}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <Leaf className="mb-3 h-10 w-10 text-accent" aria-hidden />
        <p className={cn('text-xl font-bold text-white sm:text-2xl', textClass)}>
          {t('landing.heroBadge')}
        </p>
        <p className={cn('mt-1.5 text-sm text-white/90 sm:text-base', textClass)}>
          {t('landing.heroBadgeSub')}
        </p>
      </div>
    </div>
  )
}
