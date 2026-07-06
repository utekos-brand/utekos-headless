import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode
} from 'react'
import { cn } from '@/lib/utils/className'

type PageSectionElement = 'section' | 'article' | 'div'
export type PageSectionBackground =
  | 'default'
  | 'alternate'
  | 'card'
  | 'muted'
  | 'none'

const pageSectionBackgroundClassName: Record<
  PageSectionBackground,
  string
> = {
  default: 'bg-background text-foreground',
  alternate: 'bg-alternate text-card-foreground',
  card: 'bg-card text-card-foreground',
  muted: 'bg-muted text-foreground',
  none: ''
}

interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  as?: PageSectionElement
  background?: PageSectionBackground
  children: ReactNode
  contentClassName?: string
}

export const PageSection = forwardRef<
  HTMLElement,
  PageSectionProps
>(function PageSection(
  {
    as = 'section',
    background = 'default',
    children,
    className,
    contentClassName,
    ...props
  }: PageSectionProps,
  ref
) {
  const Component = as as ElementType

  return (
    <Component
      ref={ref}
      className={cn(
        'size-full',
        pageSectionBackgroundClassName[background],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative mx-auto w-full max-w-screen items-center border-t border-t-foreground/30 px-4 py-8 sm:px-6 sm:py-12 md:px-42 md:py-16 lg:py-24',
          contentClassName
        )}
      >
        {children}
      </div>
    </Component>
  )
})
