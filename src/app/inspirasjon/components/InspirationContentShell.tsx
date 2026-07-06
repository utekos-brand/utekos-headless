import { cn } from '@/lib/utils/className'
import type { ReactNode } from 'react'
import { ContentShellClassName } from './ContentShellClassName'

export function InspirationContentShell({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(ContentShellClassName, className)}>
      {children}
    </div>
  )
}
