import { createElement, Children, isValidElement } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
type RevealTag = 'section' | 'div' | 'article' | 'li'

const variantClass: Record<RevealVariant, string> = {
  up: 'reveal-up',
  down: 'reveal-down',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
  fade: 'reveal-fade',
}

interface RevealProps {
  children: React.ReactNode
  className?: string
  variant?: RevealVariant
  delay?: number
  as?: RevealTag
  id?: string
}

export function Reveal({
  children,
  className,
  variant = 'up',
  delay = 0,
  as: Tag = 'div',
  id,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>(0.12)

  return createElement(
    Tag,
    {
      id,
      ref,
      className: cn(variantClass[variant], inView && 'reveal-visible', className),
      style: { transitionDelay: `${delay}ms` },
    },
    children
  )
}

interface RevealGroupProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  variant?: RevealVariant
}

export function RevealGroup({
  children,
  className,
  stagger = 100,
  variant = 'up',
}: RevealGroupProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.08)

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child
        return (
          <div
            key={child.key ?? i}
            className={cn(variantClass[variant], inView && 'reveal-visible')}
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}
