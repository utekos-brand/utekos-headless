import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils/className'
import type { ModelRecommendation } from '../utils/comparisonData'
import { compareModelsTheme } from '../utils/compareModelsTheme'

type PersonaRecommendationCardProps = {
  model: ModelRecommendation
}

export function PersonaRecommendationCard({
  model
}: PersonaRecommendationCardProps) {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border transition-all duration-300',
        compareModelsTheme.cardSurface,
        compareModelsTheme.cardHover,
        'hover:-translate-y-1'
      )}
    >
      <Link href={model.href as Route} className='block'>
        <div className='relative aspect-4/3 overflow-hidden'>
          <Image
            src={model.imageSrc}
            alt={model.imageAlt}
            fill
            sizes='(max-width: 1024px) 100vw, 33vw'
            className='object-cover transition-transform duration-700 group-hover:scale-[1.04]'
          />
        </div>
        <div className='p-7 sm:p-8'>
          <BrandBadge
            label={model.badge}
            tone='neutral'
            className='mb-6 px-5 py-2 text-sm'
          />
          <h3
            className={cn(
              'font-sans text-3xl leading-[0.95] font-bold tracking-[-0.01em]',
              compareModelsTheme.cardBody
            )}
          >
            {model.name}
          </h3>
          <p
            className={cn(
              'mt-3 text-lg leading-[1.35] font-medium',
              compareModelsTheme.cardBody
            )}
          >
            {model.bestFor}
          </p>
          <p
            className={cn(
              'leading-text-paragraph mt-4 text-base',
              compareModelsTheme.cardBodyMuted
            )}
          >
            {model.description}
          </p>
          <ul
            className={cn(
              'mt-6 space-y-2 text-sm font-medium',
              compareModelsTheme.cardBody
            )}
          >
            {model.proofPoints.map(point => (
              <li key={point} className='flex items-center gap-3'>
                <span
                  className='size-2 shrink-0 rounded-full bg-card-foreground'
                  aria-hidden='true'
                />
                {point}
              </li>
            ))}
          </ul>
          <span
            className={cn(
              'mt-7 inline-flex text-base font-medium underline decoration-card-foreground/35 underline-offset-8 transition-colors duration-300',
              compareModelsTheme.cardBodyMuted,
              'group-hover:text-card-foreground'
            )}
          >
            {model.cta}
          </span>
        </div>
      </Link>
    </article>
  )
}
