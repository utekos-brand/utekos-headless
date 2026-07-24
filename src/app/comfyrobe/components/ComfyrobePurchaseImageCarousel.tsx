'use client'

import Image from 'next/image'
import { useRef } from 'react'
import Fade from 'embla-carousel-fade'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { COMFYROBE_PURCHASE_GALLERY } from '../data/comfyrobePurchaseGallery'

/** Portrait crops from iPad token through landscape tablets / small laptops. */
const IPAD_MEDIA = '(min-width: 51rem) and (max-width: 85rem)'

export function ComfyrobePurchaseImageCarousel() {
  const fadePlugin = useRef(Fade())

  return (
    <div className='relative min-h-[560px] bg-muted lg:h-full lg:min-h-full'>
      <Carousel
        plugins={[fadePlugin.current]}
        slideCount={COMFYROBE_PURCHASE_GALLERY.length}
        opts={{ loop: true, align: 'center' }}
        aria-label='Comfyrobe produktbilder'
        className='relative h-full w-full'
      >
        <div className='relative aspect-[4/5] w-full overflow-hidden max-lg:min-[51rem]:aspect-[1080/1350] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full'>
          <CarouselContent className='absolute inset-0 ml-0 h-full'>
            {COMFYROBE_PURCHASE_GALLERY.map((slide, index) => {
              const fitClass =
                slide.fit === 'contain'
                  ? 'object-contain object-center'
                  : 'object-cover object-center'

              return (
                <CarouselItem
                  key={slide.id}
                  className='absolute inset-0 basis-full pl-0'
                >
                  <div
                    className={`relative size-full overflow-hidden ${slide.backdropClassName ?? 'bg-muted'}`}
                  >
                    <picture>
                      <source media={IPAD_MEDIA} srcSet={slide.ipadSrc} />
                      <Image
                        src={slide.squareSrc}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        quality={90}
                        sizes='(max-width: 815px) 100vw, (max-width: 1023px) 100vw, 50vw'
                        className={fitClass}
                      />
                    </picture>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </div>

        <CarouselPrevious
          forceVisible
          className='left-3 border-foreground/15 bg-background/80 text-foreground backdrop-blur-md hover:bg-background md:left-5'
        />
        <CarouselNext
          forceVisible
          className='right-3 border-foreground/15 bg-background/80 text-foreground backdrop-blur-md hover:bg-background md:right-5'
        />
      </Carousel>
    </div>
  )
}
