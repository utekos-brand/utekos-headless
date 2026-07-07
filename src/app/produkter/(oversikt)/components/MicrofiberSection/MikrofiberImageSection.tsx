// Path: src/app/produkter/(oversikt)/components/MicrofiberSection/MikrofiberImageSection.tsx

'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import Image from 'next/image'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils/className'

const MICROFIBER_IMAGES = [
  {
    src: '/utekos-mikrofiber-kvinner-nyter-skogen-1600-1600.webp',
    alt: 'Kvinner nyter skogen med Utekos Mikrofiber.'
  },
  {
    src: '/utekos-mikrofiber-par-nyter-kaffe-terrasse-1600-1600.webp',
    alt: 'Par nyter kaffe med Utekos Mikrofiber på terrassen vinterstid'
  },
  {
    src: '/utekos-mikrofiber-helfigur-1600-1600.webp',
    alt: 'Utekos Mikrofiber vist som fullfigur forfra.'
  },
  {
    src: '/utekos-mikrofiber-parkas-1600-1600.webp',
    alt: 'Utekos Mikrofiber vist i parkasmodus forfra.'
  },
  {
    src: '/utekos-mikrofiber-halvfigur-forside-1600-1600.webp',
    alt: 'Utekos Mikrofiber vist som åpen halvfigur forfra.'
  },
  {
    src: '/utekos-mikrofiber-bakside-full-figur-1600-1600.webp',
    alt: 'Utekos Mikrofiber vist som helfigur bakfra.'
  }
] as const

export function MikrofiberImageSection() {
  const [ref, isInView] = useInView({ threshold: 0.5 })

  return (
    <div
      ref={ref}
      className={cn(
        'will-animate-fade-in-scale relative h-full min-h-full',
        isInView && 'is-in-view'
      )}
    >
      <Carousel
        className='aspect-square w-full overflow-hidden'
        slideCount={MICROFIBER_IMAGES.length}
        opts={{ align: 'start', loop: true }}
      >
        <CarouselContent className='h-full'>
          {MICROFIBER_IMAGES.map((image, index) => (
            <CarouselItem key={image.src} className='h-full'>
              <div className='relative aspect-square w-full overflow-hidden rounded-xl'>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className='rounded-xl object-cover transition-transform duration-500 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100'
                  sizes='(max-width: 1024px) 92vw, 40vw'
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className='left-4 hidden border-border bg-card/90 text-foreground backdrop-blur-md hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring sm:inline-flex' />
        <CarouselNext className='right-4 hidden border-border bg-card/90 text-foreground backdrop-blur-md hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring sm:inline-flex' />
      </Carousel>
    </div>
  )
}
