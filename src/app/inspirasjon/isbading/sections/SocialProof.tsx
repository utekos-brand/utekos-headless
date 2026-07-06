// Path: src/app/inspirasjon/isbading/sections/SocialProof.tsx

import Image from 'next/image'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { CAROUSEL_SSR } from '@/components/ui/carousel-ssr'
import { H2 } from '@/components/typography/TypographyH2'

const galleryImages = [
  {
    src: '/comfyrobe/comfy-afterbath-1080.png',
    alt: 'En isbader kommer opp av vannet med et stort smil, klar til å ta på seg Utekos-kåpen.',
    title: 'Det øyeblikkelige rushet',
    description:
      'Sekundet du kommer opp av vannet og kjenner varmen fra kåpen treffe huden. Det er da magien skjer.'
  },
  {
    src: '/comfyrobe/comfy-isbading-to-1080.png',
    alt: 'En vennegjeng står i snøen iført Utekos-kåper og drikker kaffe etter badet.',
    title: 'Varmen i fellesskapet',
    description:
      'Isbading er ofte best sammen med andre. Del opplevelsen, kaffen og varmen uten å fryse.'
  },
  {
    src: '/comfyrobe/comfy-isbading-1080-master.png',
    alt: 'Person sitter på et svaberg med rimfrost, pakket inn i Utekos og ser utover havet.',
    title: 'Ro i sjelen',
    description:
      'Finn stillheten ved havet. Med riktig utstyr kan du sitte lenge og la pulsen synke etter sjokket.'
  },
  {
    src: '/1080/comfy-open-1080.png',
    alt: 'Person på vei fra badstue til sjøen i en Utekos-poncho.',
    title: 'Fra sauna til sjø',
    description:
      'Den perfekte følgesvenn mellom den varme badstuen og den iskalde fjorden.'
  },
  {
    src: '/1080/comfy-design-1080.png',
    alt: 'Nærbilde av en person som smiler bredt mens de har på seg Utekos-kåpen etter isbading.',
    title: 'SherpaCore™',
    description:
      'Absorberende innside av syntetisk lammeull som starter tørke- og varmeprosessen umiddelbart.'
  }
]

export function SocialProof() {
  return (
    <article className='overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24'>
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='mx-auto max-w-3xl text-center'>
          <H2
            ID='isbading-gallery'
            Text='Ekte kulde, ekte varme'
            className='mx-auto max-w-2xl text-balance pb-2 text-2xl font-semibold text-card-foreground sm:text-3xl md:text-4xl'
          />
        </div>

        <Carousel
          slideCount={galleryImages.length}
          ssr={CAROUSEL_SSR.responsiveThirds(galleryImages.length)}
          opts={{ loop: true, align: 'start' }}
          className='mx-auto mt-10 w-full max-w-5xl sm:mt-12'
        >
          <CarouselContent className='-ml-4'>
            {galleryImages.map(image => (
              <CarouselItem
                key={image.src}
                className='pl-4 md:basis-1/2 lg:basis-1/3'
              >
                <div className='group flex h-full flex-col p-1'>
                  <AspectRatio
                    ratio={1 / 1}
                    className='relative shrink-0 overflow-hidden rounded-lg border border-border bg-background'
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className='size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                  </AspectRatio>
                  <div className='flex-1 pt-4 text-left'>
                    <h3 className='font-sans text-base leading-snug font-bold text-card-foreground sm:text-lg'>
                      {image.title}
                    </h3>
                    <p className='mt-2 text-sm leading-relaxed text-card-foreground/80'>
                      {image.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            aria-label='Forrige bilde'
            className='left-2 z-10 inline-flex border-border bg-background/90 text-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card md:-left-12.5'
          />
          <CarouselNext
            aria-label='Neste bilde'
            className='right-2 z-10 inline-flex border-border bg-background/90 text-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card md:-right-12.5'
          />
        </Carousel>
      </div>
    </article>
  )
}
