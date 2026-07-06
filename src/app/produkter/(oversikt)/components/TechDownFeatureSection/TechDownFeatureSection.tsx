'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { ArrowRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { TechDownfeatures } from './TechDownFeatures'
import { TechDownImages } from './TechDownImages'
import { animate, inView, stagger } from 'motion'
import type { Route } from 'next'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'

export const TechDownFeatureSection = () => {
  const container = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = container.current
    if (!root) return

    const q = (selector: string) =>
      Array.from(root.querySelectorAll<HTMLElement>(selector))
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduced) return

    const revealTargets = q(
      '.motion-visual, .motion-content, .motion-feature-item'
    )
    revealTargets.forEach(target => {
      target.style.opacity = '0'
      target.style.willChange = 'transform, opacity'
    })

    let played = false
    const stopReveal = inView(
      root,
      () => {
        if (played) return
        played = true

        const controls = animate(
          [
            [
              q('.motion-visual'),
              { opacity: [0, 1], x: [-50, 0], scale: [0.95, 1] },
              { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
            ],
            [
              q('.motion-content'),
              { opacity: [0, 1], y: [30, 0] },
              {
                duration: 0.72,
                at: 0.28,
                delay: stagger(0.1),
                ease: [0.22, 1, 0.36, 1]
              }
            ],
            [
              q('.motion-feature-item'),
              { opacity: [0, 1], x: [20, 0] },
              {
                duration: 0.5,
                at: 0.5,
                delay: stagger(0.1),
                ease: [0.34, 1.56, 0.64, 1]
              }
            ]
          ],
          { defaultTransition: { type: 'tween' } }
        )

        controls.then(() => {
          revealTargets.forEach(target => {
            target.style.willChange = 'auto'
          })
        })

        return () => controls.stop()
      },
      { margin: '0px 0px -18% 0px', amount: 0.16 }
    )

    return () => {
      stopReveal()
    }
  }, [])

  return (
    <article
      ref={container}
      className='w-full border-y border-border py-12 md:py-16 lg:py-24'>

      <div className='container mx-auto grid grid-cols-1 gap-12 px-8 lg:grid-cols-2 lg:items-start lg:gap-20'>
        <div className='motion-visual w-full'>
          <div className='relative rounded-2xl'>
            <div className='absolute top-4 right-4 z-20 rotate-6 md:-top-4 md:-right-4 md:rotate-3'>
              <div className='flex h-24 w-24 flex-col items-center justify-center rounded-4xl bg-light p-4 text-background shadow-lg ring-1 ring-border'>
                <span className='text-xs font-bold'>Kun</span>
                <span className='text-xl font-bold'>1790,-</span>
              </div>
            </div>

            <Carousel
              className='w-full'
              slideCount={TechDownImages.length}
              opts={{ loop: true }}
            >
              <CarouselContent>
                {TechDownImages.map((image, index) => (
                  <CarouselItem
                    key={image.src.src}
                    className='p-3 sm:p-4'
                  >
                    <div className='relative aspect-square w-full overflow-hidden rounded-3xl bg-muted p-3 sm:p-4 lg:aspect-4/5'>
                      <div className='relative size-full overflow-hidden rounded-[1.15rem]'>
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className='object-cover object-center drop-shadow-2xl'
                          sizes='(max-width: 1024px) 100vw, 42vw'
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='left-4 border-border bg-background/90 text-foreground backdrop-blur-md hover:bg-background' />
              <CarouselNext className='right-4 border-border bg-background/90 text-foreground backdrop-blur-md hover:bg-background' />
            </Carousel>
          </div>
        </div>

        <div className='flex flex-col items-start px-4 lg:px-0'>

          <H2 ID='techdown-feature-section-title' Text='Møt Utekos TechDown™'>
            Utekos TechDown™
          </H2>

          <Lead Text='Vi har ikke bare kombinert det beste fra dunens letthet og mikrofiberens slitestyrke – vi har utviklet en helt ny kategori av personlig komfort.' />

          <ul className='mb-10 w-full space-y-3'>
            {TechDownfeatures.map((feature, index) => (
              <li
                key={index}
                className='motion-feature-item py-4 px-4 group bg-muted flex items-center gap-4 rounded-xl border border-transparent backdrop-blur-sm transition-all duration-300 hover:translate-x-1 hover:border-border hover:bg-muted/80'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-light transition-transform group-hover:scale-110'>
                  <feature.icon className='size-5' />
                </div>
                <span className='font-utekos-text-medium text-foreground/90 transition-colors group-hover:text-card-foreground'>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <div className='motion-content'>
            <BrandBadge
              asChild
              tone='neutral'
              className='group h-14 bg-light px-8 text-base text-background font-utekos-text-medium shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-light/80'
            >
              <Link
                href={'/produkter/utekos-techdown' as Route}
                data-track='TechDownProductPageSectionShopNowClick'
              >
                Benytt tilbudet nå
                <ArrowRight className='ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1' />
              </Link>
            </BrandBadge>
            <p className='mt-4 text-xs text-muted-foreground'>
              *Tilbudet gjelder i en begrenset periode.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
