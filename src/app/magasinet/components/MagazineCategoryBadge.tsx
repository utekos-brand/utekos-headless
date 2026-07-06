import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { BusFront, House, Lightbulb, Sparkles, Sun, Waves } from 'lucide-react'
import type { ComponentType } from 'react'
import type { MagazineCategory } from '../types'

type MagazineCategoryBadgeProps = {
  category: MagazineCategory
}

const categoryIconMap = {
  'Tips og råd': Lightbulb,
  'Om Utekos': Sparkles,
  'Hytteliv': House,
  'Terrasseliv': Sun,
  'Bobilliv': BusFront,
  'Båtliv': Waves
} satisfies Record<MagazineCategory, ComponentType<{ 'className'?: string; 'aria-hidden'?: boolean }>>

export function MagazineCategoryBadge({ category }: MagazineCategoryBadgeProps) {
  const Icon = categoryIconMap[category]

  return (
    <BrandBadge
      backgroundColor='var(--magazine-accent, var(--secondary))'
      textColor='var(--background)'
      className='gap-2 border border-background/10 border-background/10 px-4 py-2 text-sm font-semibold leading-[1.35]  '
    >
      <Icon className='size-4 shrink-0' aria-hidden />
      <span>{category}</span>
    </BrandBadge>
  )
}
