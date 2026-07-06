import { Car, Shirt, Thermometer } from 'lucide-react'
import type { InspirationHeroFeature } from '../../layout/hero/types'
import { heroFeatureSurface } from '../../theme/surfaces'

const ancientWaterCard = heroFeatureSurface('var(--ancient-water)')
const veryPeriCard = heroFeatureSurface('var(--very-peri)')
const overcastCard = heroFeatureSurface('var(--overcast)')

export const iceBathingHeroFeatures: readonly InspirationHeroFeature[] = [
  {
    title: 'Skift varmt',
    description: 'Trekk armene inn og skift skjermet etter badet',
    icon: Shirt,
    ...ancientWaterCard
  },
  {
    title: 'Varmen tilbake',
    description: 'Tørk huden raskt og hold kulden ute',
    icon: Thermometer,
    ...veryPeriCard
  },
  {
    title: 'Turen hjem',
    description: 'Behold roen og varmen helt tilbake til bilen',
    icon: Car,
    ...overcastCard
  }
] as const
