import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/className'

interface HomePageSectionFlowProps {
  children: ReactNode
  className?: string
}

export function HomePageSectionFlow({
  children,
  className
}: HomePageSectionFlowProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col overflow-x-clip *:mt-0! *:mb-0!',
        className
      )}
    >
      {children}
    </div>
  )
}
