import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils/className'
import { PatternFrame } from '@/components/ui/pattern-frame'

type SizeGuideSectionSurface = 'teal' | 'background'

type SizeGuideSectionShellProps = {
  id: string
  children: ReactNode
  surface: SizeGuideSectionSurface
  ariaLabelledby?: string
  className?: string
  contentClassName?: string
  showPattern?: boolean
}

const contentClassNames =
  'w-full px-4 py-14 sm:px-8 sm:py-16 lg:py-20'
const patternGutterWidth = 'clamp(1rem, 4vw, 2.5rem)'
const patternContentWidth =
  'min(96rem, calc(100% - var(--pattern-gutter-width, 2.5rem) - var(--pattern-gutter-width, 2.5rem)))'

const surfaceClassNames: Record<
  SizeGuideSectionSurface,
  string
> = {
  teal: 'bg-sidebar dark:bg-dark-sidebar text-sidebar-foreground dark:text-dark-sidebar-foreground',
  background:
    'bg-background dark:bg-dark-background text-foreground '
}

export function SizeGuideSectionShell({
  id,
  children,
  surface,
  ariaLabelledby,
  className,
  contentClassName,
  showPattern = true
}: SizeGuideSectionShellProps) {
  if (!showPattern) {
    return (
      <section
        id={id}
        aria-labelledby={ariaLabelledby}
        className={cn(
          'scroll-mt-28',
          surfaceClassNames[surface],
          className
        )}
      >
        <div
          className={cn(
            'max-w-9xl mx-auto',
            contentClassNames,
            contentClassName
          )}
        >
          {children}
        </div>
      </section>
    )
  }

  return (
    <PatternFrame
      as='section'
      id={id}
      aria-labelledby={ariaLabelledby}
      surface='transparent'
      variant='content'
      contentWidth={patternContentWidth}
      gutterWidth={patternGutterWidth}
      showHorizontalRules={false}
      className={cn(
        'scroll-mt-28',
        surfaceClassNames[surface],
        className
      )}
      contentClassName={cn(contentClassNames, contentClassName)}
      style={
        {
          '--pattern-fg':
            surface === 'teal' ?
              'color-mix(in oklab, var(--foreground) 10%, transparent)'
            : 'color-mix(in oklab, var(--foreground) 16%, transparent)'
        } as CSSProperties
      }
    >
      {children}
    </PatternFrame>
  )
}
