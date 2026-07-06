import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import Image from 'next/image'
import { AboutBadge } from './AboutBadge'

const galleryImages = [
  {
    src: '/webp/classic-girl-stone-snow-1080.png',
    alt: 'To personer i Utekos-plagg nyter utsikten fra en fjelltopp.'
  },
  {
    src: '/webp/kaffe-med-tilpasset-utekos-mikrofiber-vinter-terrasse-.webp',
    alt: 'En kvinne iført Utekos-plagg sitter på terrassen i snørike omgivelser.'
  },
  {
    src: '/webp/classic-couple-mobile-1080.webp',
    alt: 'En familie samlet rundt en bålpanne, alle kledd i Utekos.'
  },
  {
    src: '/ykk.webp',
    alt: 'Nærbilde av materialet og sømmene på et Utekos-produkt.'
  },
  {
    src: '/webp/classic-coffee-1080.webp',
    alt: 'En person med en kaffekopp utenfor en bobil en kjølig høstmorgen.'
  },
  {
    src: '/webp/techdown-kate-kikkert-1080.webp',
    alt: 'Utekos-plagg henger klare til bruk på en hyttevegg.'
  }
]

export function AboutGallery() {
  return (
    <article className='dark:bg-dark-secondary dark:text-dark-secondary-foreground bg-secondary px-8 py-20 text-left text-secondary-foreground sm:py-28 md:px-12 lg:px-16'>
      <div className='max-w-360 px-4 text-left sm:px-6 lg:px-8'>
        <div className='mb-10 max-w-3xl text-left'>
          <AboutBadge variant='on-secondary' className='mb-6'>
            Livet med Utekos
          </AboutBadge>
          <h2 className='dark:text-dark-secondary-foreground text-left font-sans text-5xl leading-[0.95] font-bold text-secondary-foreground sm:text-5xl'>
            Et glimt av opplevelsen
          </h2>
          <p className='font-utekos-text-medium dark:text-dark-secondary-foreground/78 mt-5 max-w-2xl text-left text-lg leading-8 text-secondary-foreground/78'>
            Se hvordan kompromissløs komfort gir liv til dine
            favorittøyeblikk utendørs.
          </p>
        </div>

        <Carousel
          aria-label='Livet med Utekos'
          className='max-w-352'
          opts={{ align: 'start', loop: true }}
          slideCount={galleryImages.length}
        >
          <CarouselContent className='-ml-4'>
            {galleryImages.map((image, index) => (
              <CarouselItem
                key={image.src}
                className='basis-full pl-4 md:basis-1/2 lg:basis-1/4'
              >
                <figure className=' dark:bg-dark-background rounded-lg border border-border bg-background p-2'>
                  <div className=' relative aspect-4/5 overflow-hidden rounded-md bg-card'>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      loading={index === 0 ? 'eager' : 'lazy'}
                      sizes='(max-width: 768px) 92vw, (max-width: 1024px) 46vw, (max-width: 1536px) 25vw, 22vw'
                      className='object-cover'
                    />
                  </div>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className=' dark:bg-dark-background dark:hover:bg-dark-card left-3 border-border bg-background text-foreground hover:bg-card sm:-left-5' />
          <CarouselNext className=' dark:bg-dark-background dark:hover:bg-dark-card right-3 border-border bg-background text-foreground hover:bg-card sm:-right-5' />
        </Carousel>
      </div>
    </article>
  )
}
