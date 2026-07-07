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

export interface InspirationPageLink {
  href: Route
  label: string
  description: string
  icon: typeof Home
}

export const inspirationPages: InspirationPageLink[] = [
  {
    href: '/inspirasjon/hytte' as Route,
    label: 'Hytteliv',
    description: 'Komfort på hytten året rundt',
    icon: Home
  },
  {
    href: '/inspirasjon/bobil' as Route,
    label: 'Bobil',
    description: 'Forleng campingsesongen',
    icon: Caravan
  },
  {
    href: '/inspirasjon/batliv' as Route,
    label: 'Båtliv',
    description: 'Varme på vannet',
    icon: Sailboat
  },
  {
    href: '/inspirasjon/terrassen' as Route,
    label: 'Terrassen',
    description: 'Hjemme best',
    icon: Sofa
  },
  {
    href: '/inspirasjon/grillkvelden' as Route,
    label: 'Grillkvelden',
    description: 'Sosiale stunder',
    icon: Flame
  },
  {
    href: '/inspirasjon/isbading' as Route,
    label: 'Isbading',
    description: 'Varme etter kuldesjokket',
    icon: Snowflake
  },
  {
    href: '/inspirasjon/camping' as Route,
    label: 'Camping',
    description: 'Mer tid i naturen',
    icon: Tent
  }
]
