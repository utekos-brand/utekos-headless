import { Anchor, Sun, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type BoatingHeroFeature = {
  title: string
  description: string
  icon: LucideIcon
}

export const boatingHeroFeatures: readonly BoatingHeroFeature[] = [
  {
    title: 'Soloppgang',
    description: 'Nyt morgenkaffeen i cockpiten',
    icon: Sun
  },
  {
    title: 'Hele kvelden',
    description: 'Forleng tiden på dekk etter solnedgang',
    icon: Waves
  },
  {
    title: 'Lengre sesong',
    description: 'Nyt båten fra tidlig vår til sen høst',
    icon: Anchor
  }
] as const
