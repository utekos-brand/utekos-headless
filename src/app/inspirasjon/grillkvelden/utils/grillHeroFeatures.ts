import { Clock, Flame, Users } from 'lucide-react'
import type { InspirationHeroFeature } from '../../layout/hero/types'

const grillHeroFeatureCard = {
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

export const grillHeroFeatures: readonly InspirationHeroFeature[] =
  [
    {
      title: 'Ved grillen',
      description: 'Hold varmen mens du steker',
      icon: Flame,
      ...grillHeroFeatureCard
    },
    {
      title: 'Hele kvelden',
      description: 'La samtalen flyte til langt på natt',
      icon: Clock,
      ...grillHeroFeatureCard
    },
    {
      title: 'For gjestene',
      description: 'Alle sitter komfortabelt utendørs',
      icon: Users,
      ...grillHeroFeatureCard
    }
  ] as const
