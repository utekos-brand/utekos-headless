import { MapPin, Mountain, Sunrise } from 'lucide-react'
import type { InspirationHeroFeature } from '../../layout/hero/types'

const bobilHeroFeatureCard = {
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

export const bobilHeroFeatures: readonly InspirationHeroFeature[] =
  [
    {
      title: 'Morgenkaffe',
      description: 'Start dagen i varme utenfor bobilen',
      icon: Sunrise,
      ...bobilHeroFeatureCard
    },
    {
      title: 'Alle stopp',
      description: 'Nyt utsikten i komfort, hvor som helst',
      icon: Mountain,
      ...bobilHeroFeatureCard
    },
    {
      title: 'Lengre turer',
      description: 'Reis tidligere på året og senere på høsten',
      icon: MapPin,
      ...bobilHeroFeatureCard
    }
  ] as const
