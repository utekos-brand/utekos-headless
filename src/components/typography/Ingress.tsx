import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Ingress({
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
        'font-utekos-text-medium text-xl tracking-normal md:text-2xl lg:max-w-4xl lg:text-3xl',
        className ?? ''
      )}
    >
      {children ?? Text}
    </p>
  )
}
