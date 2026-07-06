// Path: src/app/handlehjelp/teknologi-materialer/layout/ProductSpecsView.tsx

import {
  Cloud,
  Feather,
  Flame,
  Gem,
  Layers,
  Shield,
  Thermometer,
  Weight,
  Droplet,
  Sun,
  Zap,
  Maximize2,
  Wind,
  Shirt
} from 'lucide-react'
import { cn } from '@/lib/utils/className' // Sørg for at du har denne eller tilsvarende
import type { Technology } from '../types' // Sørg for at denne importen er korrekt i forhold til din prosjektstruktur

const iconMap: { [key: string]: React.ElementType } = {
  'thermometer': Thermometer,
  'feather': Feather,
  'weight': Weight,
  'gem': Gem,
  'shield': Shield,
  'layers': Layers,
  'flame': Flame,
  'cloud': Cloud,
  'droplet': Droplet,
  'sun': Sun,
  'zap': Zap,
  'wind': Wind,
  'maximize-2': Maximize2,
  'shirt': Shirt
}

export const TechnologyBlock = ({ tech, isActive }: { tech: Technology; isActive: boolean }) => {
  const IconComponent = iconMap[tech.icon]
  if (!IconComponent) return null

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-transparent p-6 transition-all duration-500',
        isActive ?
          'bg-sidebar dark:bg-dark-sidebar opacity-100 text-sidebar-foreground dark:text-dark-sidebar-foreground ring-1 ring-sidebar-foreground/10 dark:ring-dark-sidebar-foreground/10 backdrop-blur-sm'
        : 'opacity-30 hover:opacity-60'
      )}
    >
      <div className='flex items-center gap-4'>
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-colors',
            isActive ?
              'border-sidebar-foreground/30 dark:border-dark-sidebar-foreground/30 bg-sidebar-foreground/10 dark:bg-dark-sidebar-foreground/10 text-sidebar-foreground dark:text-dark-sidebar-foreground'
            : 'border-sidebar dark:border-dark-sidebar bg-sidebar dark:bg-dark-sidebar text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90'
          )}
        >
          <IconComponent className='h-6 w-6' />
        </div>
        <h3
          className={cn(
            'text-xl font-bold transition-colors',
            isActive ? 'text-sidebar-foreground dark:text-dark-sidebar-foreground' : 'text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90'
          )}
        >
          {tech.title}
        </h3>
      </div>
      <div className='prose prose-invert mt-4 max-w-none'>
        <p className='leading-relaxed text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90'>{tech.content}</p>
        <div className='mt-4 flex flex-wrap gap-2'>
          {tech.products.map(product => (
            <span
              key={product}
              className={cn(
                'rounded-full border px-2.5 py-1 text-sm font-medium transition-colors',
                isActive ?
                  'border-sidebar-foreground/20 dark:border-dark-sidebar-foreground/20 bg-sidebar-foreground/10 dark:bg-dark-sidebar-foreground/10 text-sidebar-foreground dark:text-dark-sidebar-foreground'
                : 'border-sidebar-foreground/20 dark:border-dark-sidebar-foreground/20 bg-transparent text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90'
              )}
            >
              {product}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
