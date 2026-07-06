import type { Route } from 'next'
export type SizeVariant = 'medium' | 'large'

export type Mode = 'parkas' | 'oppfestet' | 'fulldekket'
export interface StockDisplayProps {
  count: number
  available: boolean
  theme?: 'light' | 'dark'
}

export interface NavLink {
  label: string
  href: Route
  icon: React.ReactNode
  description: string
  /** Hide on mobile, show from md breakpoint and up */
  mdOnly?: boolean
}
