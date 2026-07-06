import { Clock, Flame, Users } from 'lucide-react'
import type { InspirationHeroFeature } from '../../layout/hero/types'

const grillHeroFeatureCard = {
  surface: 'var(--mountain-view)',
  border: 'color-mix(in oklch, var(--cloud-dancer) 18%, transparent)',
  titleColor: 'var(--foreground)',
  descriptionColor: 'var(--foreground)',
  iconSurface: 'var(--mineral-green)',
  iconBorder: 'transparent',
  iconColor: 'var(--fairest-jade)',
  iconClassName: 'border-0',
  shadow: '0 18px 46px -34px color-mix(in oklch, var(--background) 55%, transparent)'
} as const satisfies Omit<InspirationHeroFeature, 'title' | 'description' | 'icon'>

export const grillHeroFeatures: readonly InspirationHeroFeature[] = [
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
