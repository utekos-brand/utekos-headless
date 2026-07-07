import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { CAROUSEL_SSR } from '@/components/ui/carousel-ssr'
import { H2 } from '@/components/typography/TypographyH2'
import { galleryImages } from '../utils/galleryImages'

export function InspirationGallerySection() {
  return (
    <article className='overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <div className='max-w-4xl'>
          <H2
            Text='Utekos i sitt rette element'
            ID='utekos-i-sitt-rette-element'
          />
          <p className='max-w-lg text-base leading-relaxed text-foreground/90 mt-2 sm:text-lg'>
            Fra morgenkaffen i soloppgang til sene kvelder under
            stjernene. La deg inspirere av ekte øyeblikk fra
            bobillivet.
          </p>
        </div>

        <Carousel
          slideCount={galleryImages.length}
          ssr={CAROUSEL_SSR.responsiveThirds(
            galleryImages.length
          )}
          opts={{ loop: true, align: 'start' }}
          className='mt-10 w-full sm:mt-12'
        >
          <CarouselContent className='-ml-4'>
            {galleryImages.map(image => (
              <CarouselItem
                key={image.src}
                className='pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4'
              >
                <div className='group flex h-full flex-col p-1'>
                  <div className='relative aspect-square shrink-0 overflow-hidden rounded-lg border border-border bg-card'>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className='size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                  </div>
                  <div className='flex-1 pt-4 text-left'>
                    <h3 className='font-sans text-base leading-snug font-bold text-foreground sm:text-lg'>
                      {image.title}
                    </h3>
                    <p className='mt-2 text-sm leading-relaxed text-foreground/90'>
                      {image.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            aria-label='Forrige bilde'
            className='left-2 hidden border-border bg-background/90 text-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex'
          />
          <CarouselNext
            aria-label='Neste bilde'
            className='right-2 hidden border-border bg-background/90 text-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex'
          />
        </Carousel>
      </InspirationContentShell>
    </article>
  )
}
