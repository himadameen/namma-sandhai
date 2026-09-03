import { cn } from '@/lib/utils'

function Layer({
  className,
  delay = 0,
  children,
}: {
  className?: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <div
      className={cn('splash-layer absolute', className)}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden
    >
      {children}
    </div>
  )
}

/** Rich Tamil Nadu heritage + farming panorama for splash */
export function SplashVectors() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="splash-sky-wash absolute inset-0" />
      <div className="splash-vignette absolute inset-0" />

      <Layer className="splash-layer-sun -right-6 top-4 sm:-right-4 sm:top-6 md:right-8 md:top-10" delay={0}>
        <svg
          viewBox="0 0 160 160"
          fill="none"
          className="splash-sun-rays h-20 w-20 sm:h-28 sm:w-28 md:h-40 md:w-40"
        >
          <circle cx="80" cy="80" r="36" fill="url(#sunCore)" />
          <circle cx="80" cy="80" r="24" fill="#F5D78E" opacity="0.9" />
          {Array.from({ length: 12 }).map((_, i) => {
            const deg = i * 30
            return (
              <line
                key={deg}
                x1="80"
                y1="80"
                x2={80 + 58 * Math.cos((deg * Math.PI) / 180)}
                y2={80 + 58 * Math.sin((deg * Math.PI) / 180)}
                stroke="#D9A441"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.45"
              />
            )
          })}
          <defs>
            <radialGradient id="sunCore" cx="0.4" cy="0.35" r="0.65">
              <stop stopColor="#FFE9A8" />
              <stop offset="1" stopColor="#D9A441" />
            </radialGradient>
          </defs>
        </svg>
      </Layer>

      <Layer className="splash-layer-rise inset-x-0 bottom-0" delay={100}>
        <svg
          viewBox="0 0 1440 420"
          className="h-[34vh] min-h-[180px] w-full sm:h-[42vh] sm:min-h-[240px] md:h-[46vh]"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
        >
          <defs>
            <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#1E5C42" />
              <stop offset="1" stopColor="#164A35" />
            </linearGradient>
            <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#3F8F5F" />
              <stop offset="1" stopColor="#2D6A4F" />
            </linearGradient>
            <linearGradient id="fieldGreen" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#4DA66E" />
              <stop offset="1" stopColor="#3F8F5F" />
            </linearGradient>
            <linearGradient id="waterShine" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#7EC8A0" stopOpacity="0.5" />
              <stop offset="0.5" stopColor="#A8DFC0" stopOpacity="0.7" />
              <stop offset="1" stopColor="#7EC8A0" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          <path
            d="M0 220 C180 120, 360 180, 540 130 C720 80, 900 160, 1080 110 C1260 60, 1350 140, 1440 100 V420 H0 Z"
            fill="url(#hillFar)"
            opacity="0.55"
          />
          <path
            d="M0 260 C200 200, 420 230, 640 190 C860 150, 1080 220, 1280 180 C1360 160, 1400 200, 1440 190 V420 H0 Z"
            fill="url(#hillNear)"
            opacity="0.7"
          />
          <path d="M0 310 Q360 280, 720 300 T1440 285 V420 H0 Z" fill="url(#fieldGreen)" />
          <path d="M0 335 Q280 318, 560 328 T1120 320 T1440 325 V420 H0 Z" fill="#164A35" opacity="0.35" />
          <path d="M0 355 Q240 345, 480 352 T960 348 T1440 355 V420 H0 Z" fill="#164A35" opacity="0.25" />
          <path d="M0 368 Q720 358, 1440 370 V382 Q720 372, 0 382 Z" fill="url(#waterShine)" className="splash-water-shimmer" />

          {Array.from({ length: 28 }).map((_, i) => {
            const x = 50 + i * 50
            return (
              <g key={x} opacity="0.75">
                <line x1={x} y1="340" x2={x} y2="308" stroke="#164A35" strokeWidth="1.5" />
                <ellipse cx={x} cy="306" rx="5" ry="10" fill="#D9A441" opacity="0.65" />
              </g>
            )
          })}

          <g transform="translate(280, 155)" opacity="0.85">
            <path d="M0 90 L8 55 H18 L10 35 H16 L8 12 L0 35 H6 L-2 55 H8 Z" fill="#C4953A" />
            <path d="M-6 55 H14 V62 H-6 Z" fill="#164A35" />
            <rect x="-10" y="62" width="28" height="6" fill="#164A35" />
            <rect x="-14" y="68" width="36" height="8" fill="#1E5C42" />
            <rect x="-18" y="76" width="44" height="10" fill="#164A35" />
            <rect x="-22" y="86" width="52" height="12" fill="#1E5C42" />
          </g>

          <g transform="translate(1180, 200)" opacity="0.9">
            <path d="M0 130 V50" stroke="#5C3D2E" strokeWidth="4" strokeLinecap="round" />
            <path d="M0 50 C-28 38, -38 18, -32 4" stroke="#2D6A4F" strokeWidth="3" fill="none" />
            <path d="M0 48 C28 34, 38 16, 32 2" stroke="#2D6A4F" strokeWidth="3" fill="none" />
            <path d="M0 46 C0 24, -6 8, 0 0" stroke="#3F8F5F" strokeWidth="3" fill="none" />
            <ellipse cx="-32" cy="2" rx="14" ry="7" fill="#3F8F5F" />
            <ellipse cx="32" cy="0" rx="14" ry="7" fill="#3F8F5F" />
            <ellipse cx="0" cy="-2" rx="12" ry="6" fill="#4DA66E" />
          </g>

          <g transform="translate(120, 248)" className="splash-farmer-glow">
            <ellipse cx="42" cy="88" rx="22" ry="8" fill="#000" opacity="0.08" />
            <path d="M42 38 C48 38, 52 44, 52 50 C52 58, 46 62, 42 62 C38 62, 32 58, 32 50 C32 44, 36 38, 42 38 Z" fill="#6B4423" />
            <path d="M32 46 C32 36, 52 36, 52 46 C52 40, 42 32, 32 46 Z" fill="#D9A441" />
            <path d="M38 36 C42 28, 48 28, 52 36" stroke="#C4953A" strokeWidth="2" fill="none" />
            <path d="M28 62 H56 V92 C56 98, 28 98, 28 92 Z" fill="#F7F6EF" />
            <path d="M28 62 H56 V72 H28 Z" fill="#164A35" opacity="0.15" />
            <path d="M28 68 L14 78" stroke="#6B4423" strokeWidth="4" strokeLinecap="round" />
            <path d="M56 68 L68 76" stroke="#6B4423" strokeWidth="4" strokeLinecap="round" />
            <path d="M6 78 H26 L22 98 H10 Z" fill="#8B5E3C" />
            <path d="M8 78 C8 72, 24 72, 24 78" stroke="#6B4423" strokeWidth="2" fill="none" />
            <circle cx="14" cy="86" r="4" fill="#C0392B" opacity="0.8" />
            <circle cx="20" cy="88" r="3.5" fill="#D9A441" />
            <ellipse cx="17" cy="82" rx="3" ry="2" fill="#4DA66E" />
            <path d="M34 98 V118" stroke="#164A35" strokeWidth="5" strokeLinecap="round" />
            <path d="M50 98 V118" stroke="#164A35" strokeWidth="5" strokeLinecap="round" />
          </g>

          <g transform="translate(1050, 268)" opacity="0.92">
            <ellipse cx="55" cy="58" rx="38" ry="6" fill="#000" opacity="0.07" />
            <rect x="28" y="18" width="62" height="28" rx="4" fill="#8B5E3C" />
            <rect x="32" y="22" width="54" height="20" rx="2" fill="#A0714F" />
            <circle cx="42" cy="52" r="12" stroke="#5C3D2E" strokeWidth="3" fill="#F7F6EF" />
            <circle cx="76" cy="52" r="12" stroke="#5C3D2E" strokeWidth="3" fill="#F7F6EF" />
            <circle cx="42" cy="52" r="4" fill="#5C3D2E" />
            <circle cx="76" cy="52" r="4" fill="#5C3D2E" />
            <ellipse cx="12" cy="44" rx="14" ry="9" fill="#6B4423" />
            <path d="M0 44 C-6 40, -8 34, -4 30" stroke="#6B4423" strokeWidth="3" fill="none" />
            <circle cx="-2" cy="28" r="5" fill="#6B4423" />
            <path d="M22 40 H28" stroke="#5C3D2E" strokeWidth="2.5" />
          </g>
        </svg>
      </Layer>

      <Layer className="splash-layer-spin left-3 top-[14%] hidden sm:left-6 sm:top-[18%] sm:block md:left-12" delay={200}>
        <svg width="100" height="100" viewBox="0 0 100 100" className="h-14 w-14 opacity-35 sm:h-[100px] sm:w-[100px]">
          <circle cx="50" cy="50" r="4" fill="#D9A441" />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <circle
              key={deg}
              cx={50 + 28 * Math.cos((deg * Math.PI) / 180)}
              cy={50 + 28 * Math.sin((deg * Math.PI) / 180)}
              r={i % 2 === 0 ? 5 : 3}
              fill={i % 2 === 0 ? '#164A35' : '#D9A441'}
            />
          ))}
          {[0, 90, 180, 270].map((deg) => (
            <circle
              key={`m-${deg}`}
              cx={50 + 14 * Math.cos((deg * Math.PI) / 180)}
              cy={50 + 14 * Math.sin((deg * Math.PI) / 180)}
              r="2.5"
              fill="#3F8F5F"
            />
          ))}
        </svg>
      </Layer>

      <Layer className="splash-layer-spin right-8 top-[20%] hidden sm:block" delay={260}>
        <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-30">
          <circle cx="40" cy="40" r="3" fill="#164A35" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <circle
              key={deg}
              cx={40 + 20 * Math.cos((deg * Math.PI) / 180)}
              cy={40 + 20 * Math.sin((deg * Math.PI) / 180)}
              r="2.5"
              fill="#D9A441"
            />
          ))}
        </svg>
      </Layer>

      {[
        { cls: 'splash-pollen-a left-[12%] top-[28%] hidden sm:block', rot: -20, delay: 320 },
        { cls: 'splash-pollen-b right-[12%] top-[32%] hidden sm:block', rot: 25, delay: 380 },
        { cls: 'splash-pollen-a left-[22%] top-[52%] hidden md:block', rot: 10, delay: 420 },
        { cls: 'splash-pollen-b right-[18%] top-[48%] hidden md:block', rot: -15, delay: 460 },
      ].map(({ cls, rot, delay }, i) => (
        <Layer key={i} className={cls} delay={delay}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ transform: `rotate(${rot}deg)` }}>
            <path d="M22 38 C22 38, 6 28, 8 10 C14 20, 22 26, 22 38 Z" fill="#3F8F5F" opacity="0.55" />
            <path d="M22 38 V12" stroke="#164A35" strokeWidth="1.5" opacity="0.5" />
          </svg>
        </Layer>
      ))}

      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="splash-mote absolute rounded-full bg-accent/40"
          style={{
            left: `${8 + (i * 5.2) % 88}%`,
            top: `${12 + (i * 7.3) % 55}%`,
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            animationDelay: `${i * 180}ms`,
          }}
          aria-hidden
        />
      ))}
    </div>
  )
}
