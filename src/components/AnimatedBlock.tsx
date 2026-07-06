'use client'

import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils/className'
import type { ReactNode } from 'react'

interface AnimatedBlockProps {
  children?: ReactNode // Gjort valgfri med '?'
  className?: string
  delay?: string
  rootMargin?: string
  threshold?: number
}

export function AnimatedBlock({
  children,
  className,
  delay = '0s',
  rootMargin = '0px',
  threshold = 0.2
}: AnimatedBlockProps) {
  const [ref, isInView] = useInView({ rootMargin, threshold })

  return (
    <div
      ref={ref}
      className={cn(className, isInView && 'is-in-view')}
      style={{ '--transition-delay': delay } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
