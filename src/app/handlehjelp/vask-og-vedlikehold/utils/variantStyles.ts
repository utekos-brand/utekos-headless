import { Check, Minus } from 'lucide-react'

export const variantStyles = {
  do: {
    container:
      'border-primary/24 dark:border-dark-primary/24 bg-card ',
    iconWrap:
      'border-primary/30 dark:border-dark-primary/30 bg-primary dark:bg-dark-primary text-foreground ',
    Icon: Check
  },
  dont: {
    container:
      'border-foreground/12 dark:border-dark-foreground/12 bg-night/40',
    iconWrap:
      'border-foreground/18 dark:border-dark-foreground/18 bg-card  text-foreground ',
    Icon: Minus
  }
} as const
