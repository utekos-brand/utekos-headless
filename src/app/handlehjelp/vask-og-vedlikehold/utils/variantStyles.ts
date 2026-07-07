import { Check, Minus } from 'lucide-react'

export const variantStyles = {
  do: {
    container:
      'border-primary/24 border-primary/24 bg-card ',
    iconWrap:
      'border-primary/30 border-primary/30 bg-primary text-foreground ',
    Icon: Check
  },
  dont: {
    container:
      'border-foreground/12 border-foreground/12 bg-night/40',
    iconWrap:
      'border-foreground/18 border-foreground/18 bg-card  text-foreground ',
    Icon: Minus
  }
} as const
