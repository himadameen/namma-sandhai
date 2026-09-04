import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback: React.ReactNode
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (failed || !src) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className}
      onError={(e) => {
        setFailed(true)
        onError?.(e)
      }}
      {...props}
    />
  )
}

interface PlaceholderFrameProps {
  children?: React.ReactNode
  className?: string
  gradient?: 'hero' | 'crop' | 'portrait'
}

export function PlaceholderFrame({
  children,
  className,
  gradient = 'hero',
}: PlaceholderFrameProps) {
  const gradients = {
    hero: 'from-primary via-secondary to-primary/70',
    crop: 'from-secondary/80 via-primary/60 to-secondary/90',
    portrait: 'from-primary/90 via-secondary/70 to-primary/80',
  }

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br',
        gradients[gradient],
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
