// Path: src/app/produkter/[handle]/ProductPageView/components/ProductGalleryCard.tsx

import { AnimatedBlock } from '@/components/AnimatedBlock'

export interface ProductGalleryCardProps {
  galleryContent: React.ReactNode
  enableStickyOnDesktop?: boolean
  hasIntegratedBackground?: boolean
  integratedBackgroundSize?: 'wide' | 'compact'
  flushOnMobile?: boolean
  stickyTopClassName?: string
  ariaLabel?: string
}

export default function ProductGalleryCard({
  galleryContent,
  enableStickyOnDesktop = true,
  hasIntegratedBackground = false,
  integratedBackgroundSize = 'wide',
  flushOnMobile = false,
  stickyTopClassName = 'md:top-32 lg:top-28',
  ariaLabel
}: ProductGalleryCardProps) {
  const integratedBackgroundClassName =
    integratedBackgroundSize === 'compact' ?
      'group relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-[1.5rem] bg-transparent transition-all duration-300 lg:max-w-xl xl:max-w-2xl'
    : [
        'group relative overflow-hidden bg-transparent transition-all duration-300',
        flushOnMobile ?
          'w-full rounded-none shadow-none md:-ml-8 md:mr-0 md:w-[calc(100%+2rem)] md:rounded-[1.5rem] md:shadow-2xl md:shadow-havdyp/18'
        : '-ml-4 aspect-square w-[calc(100%+1rem)] rounded-[1.5rem] shadow-2xl shadow-havdyp/18 md:-ml-8 md:w-[calc(100%+2rem)]'
      ].join(' ')
  const defaultBackgroundClassName =
    flushOnMobile ?
      'group relative w-full overflow-hidden rounded-none bg-foreground/72 dark:bg-dark-foreground/72 shadow-none transition-all duration-300 md:-ml-8 md:mr-0 md:w-[calc(100%+2rem)] md:rounded-[1.5rem] md:shadow-2xl md:shadow-background/10 dark:md:shadow-dark-background/10'
    : 'group relative w-full overflow-hidden rounded-[1.5rem] bg-foreground/72 dark:bg-dark-foreground/72 shadow-2xl shadow-background/10 dark:shadow-dark-background/10 transition-all duration-300 '

  return (
    <div
      className={[
        enableStickyOnDesktop ?
          `size-full md:sticky ${stickyTopClassName}`
        : 'size-full',
        'z-10'
      ].join(' ')}
    >
      <AnimatedBlock
        className='will-animate-fade-in-scale size-full'
        delay='0.12s'
        threshold={0.2}
      >
        <article
          aria-label={ariaLabel}
          className='size-full rounded-3xl'
        >
          {hasIntegratedBackground ?
            <div
              className={`${integratedBackgroundClassName} size-full`}
            >
              {galleryContent}
            </div>
          : <div className={defaultBackgroundClassName}>
              <div className='relative'>{galleryContent}</div>
            </div>
          }
        </article>
      </AnimatedBlock>
    </div>
  )
}
