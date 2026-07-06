import { Anchor, Sun, Waves } from 'lucide-react'
import type { InspirationHeroFeature } from '../layout/hero/types'
import { heroFeatureSurface } from '../theme/surfaces'

const headerSecondaryCard = heroFeatureSurface('var(--header-secondary)')
const veryPeriCard = heroFeatureSurface('var(--very-peri)')
const ancientWaterCard = heroFeatureSurface('var(--ancient-water)')

export const boatingHeroFeatures: readonly InspirationHeroFeature[] = [
  {
    title: 'Soloppgang',
    description: 'Nyt morgenkaffeen i cockpiten',
    icon: Sun,
    ...headerSecondaryCard
  },
  {
    title: 'Hele kvelden',
    description: 'Forleng tiden på dekk etter solnedgang',
    icon: Waves,
    ...ancientWaterCard
  },
  {
    title: 'Lengre sesong',
    description: 'Nyt båten fra tidlig vår til sen høst',
    icon: Anchor,
    ...veryPeriCard
  }
] as const
