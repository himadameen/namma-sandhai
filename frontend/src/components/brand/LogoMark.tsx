import { useId } from 'react'
import { cn } from '@/lib/utils'

type LogoMarkSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero'
type LogoMarkVariant = 'default' | 'light' | 'muted'

interface LogoMarkProps {
  size?: LogoMarkSize
  variant?: LogoMarkVariant
  className?: string
}

const sizePx: Record<LogoMarkSize, number> = {
  xs: 28,
  sm: 34,
  md: 42,
  lg: 52,
  hero: 64,
}

export function LogoMark({ size = 'md', variant = 'default', className }: LogoMarkProps) {
  const px = sizePx[size]
  const light = variant === 'light'
  const muted = variant === 'muted'
  const uid = useId().replace(/:/g, '')
  const bgId = `logoMarkBg-${uid}`
  const leafId = `logoMarkLeaf-${uid}`

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={bgId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#164A35" />
          <stop offset="1" stopColor="#3F8F5F" />
        </linearGradient>
        <linearGradient id={leafId} x1="32" y1="14" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor={light ? '#FFFFFF' : '#E8F5EE'} />
          <stop offset="1" stopColor={light ? '#D4EBDC' : '#FFFFFF'} />
        </linearGradient>
      </defs>

      {/* Badge */}
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="16"
        fill={muted ? 'none' : light ? 'rgba(255,255,255,0.15)' : `url(#${bgId})`}
        stroke={muted ? 'rgba(255,255,255,0.35)' : light ? 'rgba(255,255,255,0.25)' : 'none'}
        strokeWidth={muted ? 1.5 : 0}
      />

      {/* Decorative leaf arcs — market / harvest ring */}
      <path
        d="M14 44 C18 36, 24 32, 32 31 C40 32, 46 36, 50 44"
        stroke={light || muted ? 'rgba(255,255,255,0.35)' : '#D9A441'}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M18 24 C22 18, 27 15, 32 14 C37 15, 42 18, 46 24"
        stroke={light || muted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.35)'}
        strokeWidth="1.25"
        strokeLinecap="round"
        fill="none"
      />

      {/* Center stem */}
      <path
        d="M32 46 V28"
        stroke={light || muted ? '#FFFFFF' : '#FFFFFF'}
        strokeWidth="2.25"
        strokeLinecap="round"
      />

      {/* Left leaf */}
      <path
        d="M32 30 C26 28, 20 24, 18 18 C22 22, 27 26, 32 28 C32 28 32 30 32 30 Z"
        fill={`url(#${leafId})`}
        opacity={light || muted ? 0.95 : 1}
      />

      {/* Right leaf */}
      <path
        d="M32 30 C38 28, 44 24, 46 18 C42 22, 37 26, 32 28 C32 28 32 30 32 30 Z"
        fill={`url(#${leafId})`}
        opacity={light || muted ? 0.95 : 1}
      />

      {/* Top leaf */}
      <path
        d="M32 26 C30 20, 30 15, 32 12 C34 15, 34 20, 32 26 Z"
        fill={light || muted ? '#FFFFFF' : '#FFFFFF'}
        opacity="0.92"
      />

      {/* Seed / soil accent */}
      <circle
        cx="32"
        cy="48"
        r="2.5"
        fill={light || muted ? '#D9A441' : '#D9A441'}
        opacity="0.9"
      />
    </svg>
  )
}
