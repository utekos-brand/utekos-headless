import {
  Caravan,
  Flame,
  Home,
  Sailboat,
  Snowflake,
  Sofa,
  Tent
} from 'lucide-react'
import type { Route } from 'next'
import type { TextOnAccent } from '../theme/pageAccents'

export interface InspirationPageLink {
  href: Route
  label: string
  description: string
  icon: typeof Home
  color: string
  midColor: string
  iconColor: string
  textOnAccent: TextOnAccent
}

export const inspirationPages: InspirationPageLink[] = [
  {
    href: '/inspirasjon/hytte' as Route,
    label: 'Hytteliv',
    description: 'Komfort på hytten året rundt',
    icon: Home,
    color: 'var(--secondary)',
    midColor: 'var(--card)',
    iconColor: 'text-secondary-foreground',
    textOnAccent: 'foreground'
  },
  {
    href: '/inspirasjon/bobil' as Route,
    label: 'Bobil',
    description: 'Forleng campingsesongen',
    icon: Caravan,
    color: 'var(--primary)',
    midColor: 'var(--card)',
    iconColor: 'text-primary-foreground',
    textOnAccent: 'foreground'
  },
  {
    href: '/inspirasjon/batliv' as Route,
    label: 'Båtliv',
    description: 'Varme på vannet',
    icon: Sailboat,
    color: 'var(--secondary)',
    midColor: 'var(--muted)',
    iconColor: 'text-secondary-foreground',
    textOnAccent: 'foreground'
  },
  {
    href: '/inspirasjon/terrassen' as Route,
    label: 'Terrassen',
    description: 'Hjemme best',
    icon: Sofa,
    color: 'var(--card)',
    midColor: 'var(--primary)',
    iconColor: 'text-card-foreground',
    textOnAccent: 'foreground'
  },
  {
    href: '/inspirasjon/grillkvelden' as Route,
    label: 'Grillkvelden',
    description: 'Sosiale stunder',
    icon: Flame,
    color: 'var(--primary)',
    midColor: 'var(--secondary)',
    iconColor: 'text-primary-foreground',
    textOnAccent: 'foreground'
  },
  {
    href: '/inspirasjon/isbading' as Route,
    label: 'Isbading',
    description: 'Varme etter kuldesjokket',
    icon: Snowflake,
    color: 'var(--secondary)',
    midColor: 'var(--card)',
    iconColor: 'text-secondary-foreground',
    textOnAccent: 'foreground'
  },
  {
    href: '/inspirasjon/camping' as Route,
    label: 'Camping',
    description: 'Mer tid i naturen',
    icon: Tent,
    color: 'var(--muted)',
    midColor: 'var(--secondary)',
    iconColor: 'text-foreground',
    textOnAccent: 'foreground'
  }
]
