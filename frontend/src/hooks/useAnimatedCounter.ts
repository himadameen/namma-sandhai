import { useEffect, useState } from 'react'

function parseStatValue(value: string): { num: number; prefix: string; suffix: string } {
  const normalized = value.replace(/,/g, '')
  const match = normalized.match(/^([^0-9]*)([\d.]+)(.*)$/)
  if (!match) return { num: 0, prefix: '', suffix: value }
  return { num: parseFloat(match[2]), prefix: match[1], suffix: match[3] }
}

export function useAnimatedCounter(
  target: string,
  duration = 1400,
  enabled = true
): string {
  const { num, prefix, suffix } = parseStatValue(target)
  const [current, setCurrent] = useState(enabled ? 0 : num)

  useEffect(() => {
    if (!enabled) {
      setCurrent(num)
      return
    }

    let start: number | null = null
    let frame: number

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(num * eased))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [num, duration, enabled])

  const hasDecimal = target.replace(/,/g, '').includes('.')
  const formatted = hasDecimal
    ? (Math.round(current * 10) / 10).toLocaleString('en-IN')
    : current.toLocaleString('en-IN')

  return `${prefix}${formatted}${suffix}`
}
