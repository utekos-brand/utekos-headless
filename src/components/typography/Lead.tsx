import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Lead({
  Text,
  children,
  className
}: {
  Text?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'font-utekos-text pb-4 text-lg tracking-normal md:pb-6 md:text-2xl',
        className ?? ''
      )}
    >
      {children ?? Text}
    </p>
  )
}
