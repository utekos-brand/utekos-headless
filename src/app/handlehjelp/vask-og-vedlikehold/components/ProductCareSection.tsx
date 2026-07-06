import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils/className'
import { PatternFrame } from '@/components/ui/pattern-frame'

const toneStyles = {
  base: 'bg-transparent',
  elevated:
    'border-t border-border  bg-card  text-card-foreground '
} as const

type ProductCareSectionTone = keyof typeof toneStyles

interface ProductCareSectionProps {
  'tone'?: ProductCareSectionTone
  'children': ReactNode
  'className'?: string
  'containerClassName'?: string
  'aria-labelledby'?: string
}

const contentClassNames =
  'w-full px-4 py-14 sm:px-8 sm:py-16 lg:py-20'
const patternGutterWidth = 'clamp(1rem, 4vw, 2.5rem)'
const patternContentWidth =
  'min(96rem, calc(100% - var(--pattern-gutter-width, 2.5rem) - var(--pattern-gutter-width, 2.5rem)))'

export function ProductCareSection({
  tone = 'base',
  children,
  className,
  containerClassName,
  'aria-labelledby': ariaLabelledby
}: ProductCareSectionProps) {
  return (
    <PatternFrame
      as='section'
      aria-labelledby={ariaLabelledby}
      surface='transparent'
      variant='content'
      contentWidth={patternContentWidth}
      gutterWidth={patternGutterWidth}
      showHorizontalRules={false}
      className={cn(
        'scroll-mt-28',
        'text-foreground',
        toneStyles[tone],
        className
      )}
      contentClassName={cn(
        contentClassNames,
        containerClassName
      )}
      style={
        {
          '--pattern-fg':
            tone === 'elevated' ?
              'color-mix(in oklab, var(--foreground) 10%, transparent)'
            : 'color-mix(in oklab, var(--foreground) 16%, transparent)'
        } as CSSProperties
      }
    >
      {children}
    </PatternFrame>
  )
}
