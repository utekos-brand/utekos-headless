import { cn } from '@/lib/utils/className'
import type { ReactNode } from 'react'

type AboutBadgeProps = {
  children: ReactNode
  className?: string
  variant?:
    | 'primary'
    | 'accent'
    | 'card'
    | 'inverse'
    | 'on-secondary'
}

const variants = {
  'primary':
    'bg-primary dark:bg-dark-primary text-primary-foreground ',
  'accent':
    'bg-accent dark:bg-dark-accent text-accent-foreground dark:text-dark-accent-foreground',
  'card': 'bg-card  text-card-foreground ',
  'inverse':
    'bg-foreground dark:bg-dark-foreground text-background dark:text-dark-background',
  /*
    Elevated chip on bg-secondary dark:bg-dark-secondary — light+dark ratios in semantic.*.css:
    secondary-foreground on secondary >= 10.9:1 (1.4.3); edge vs section >= 3:1 (1.4.11).
  */
  'on-secondary':
    'border border-secondary-foreground/22 dark:border-dark-secondary-foreground/22 bg-secondary-foreground dark:bg-dark-secondary-foreground text-secondary dark:text-dark-secondary'
}

export function AboutBadge({
  children,
  className,
  variant = 'card'
}: AboutBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-full px-8 py-4 text-base leading-6 font-semibold sm:text-lg',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
