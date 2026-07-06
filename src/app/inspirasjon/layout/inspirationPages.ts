import { Caravan, Flame, Home, Sailboat, Snowflake, Sofa } from 'lucide-react'
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
  /** Tekst på cross-link-kort — erstatter pageIndex-heuristikk */
  textOnAccent: TextOnAccent
}

export const inspirationPages: InspirationPageLink[] = [
  {
    href: '/inspirasjon/hytteliv' as Route,
    label: 'Hytteliv',
    description: 'Komfort på hytten året rundt',
    icon: Home,
    color: 'var(--ancient-water)',
    midColor: 'var(--mountain-view)',
    iconColor: 'text-(--ancient-water)',
    textOnAccent: 'background'
  },
  {
    href: '/inspirasjon/bobil' as Route,
    label: 'Bobil',
    description: 'Forleng campingsesongen',
    icon: Caravan,
    color: 'var(--fair-orchid)',
    midColor: 'var(--mountain-view)',
    iconColor: 'text-(--fair-orchid)',
    textOnAccent: 'background'
  },
  {
    href: '/inspirasjon/batliv' as Route,
    label: 'Båtliv',
    description: 'Varme på vannet',
    icon: Sailboat,
    color: 'var(--skipper-blue)', // Sikrer skarp kontrast mot 'cloud-dancer'
    midColor: 'var(--ancient-water)',
    iconColor: 'text-(--skipper-blue)',
    textOnAccent: 'cloud-dancer'
  },
  {
    href: '/inspirasjon/terrassen' as Route,
    label: 'Terrassen',
    description: 'Hjemme best',
    icon: Sofa,
    color: 'var(--mountain-view)',
    midColor: 'var(--primary)',
    iconColor: 'text-(--mountain-view)',
    textOnAccent: 'cloud-dancer'
  },
  {
    href: '/inspirasjon/grillkvelden' as Route,
    label: 'Grillkvelden',
    description: 'Sosiale stunder',
    icon: Flame,
    color: 'var(--primary)',
    midColor: 'var(--skipper-blue)',
    iconColor: 'text-(--primary)',
    textOnAccent: 'background' // Kritisk WCAG-fiks: --primary krever mørk tekst
  }
]
