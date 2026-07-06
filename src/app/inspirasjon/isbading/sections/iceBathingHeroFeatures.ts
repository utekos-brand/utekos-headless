import { Car, Shirt, Thermometer } from 'lucide-react'
import type { InspirationHeroFeature } from '../../layout/hero/types'

const iceBathingHeroFeatureCard = {
  surface: 'var(--card)',
  border:
    'color-mix(in oklch, var(--foreground) 18%, transparent)',
  titleColor: 'var(--card-foreground)',
  descriptionColor: 'var(--card-foreground)',
  iconSurface: 'var(--secondary)',
  iconBorder: 'transparent',
  iconColor: 'var(--secondary-foreground)',
  iconClassName: 'border-0',
  shadow:
    '0 18px 46px -34px color-mix(in oklch, var(--background) 55%, transparent)'
} as const satisfies Omit<
  InspirationHeroFeature,
  'title' | 'description' | 'icon'
>

export const iceBathingHeroFeatures: readonly InspirationHeroFeature[] = [
  {
    title: 'Skift varmt',
    description: 'Trekk armene inn og skift skjermet etter badet',
    icon: Shirt,
    ...iceBathingHeroFeatureCard
  },
  {
    title: 'Varmen tilbake',
    description: 'Tørk huden raskt og hold kulden ute',
    icon: Thermometer,
    ...iceBathingHeroFeatureCard
  },
  {
    title: 'Turen hjem',
    description: 'Behold roen og varmen helt tilbake til bilen',
    icon: Car,
    ...iceBathingHeroFeatureCard
  }
] as const
