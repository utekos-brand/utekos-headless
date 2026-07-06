'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { ArrowRight, Gift } from 'lucide-react'
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

    const loopControls = q('.motion-glow').map(element =>
      animate(
        element,
        { opacity: [1, 0.3, 1], scale: [1, 1.2, 1] },
        { duration: 4, ease: 'easeInOut', repeat: Infinity }
      )
    )

    return () => {
      stopReveal()
      loopControls.forEach(control => control.stop())
    }
  }, [])

  return (
    <article
      ref={container}
      className='relative my-24 overflow-hidden rounded-3xl border border-border bg-card py-16 text-card-foreground md:my-32 md:py-24'
    >
      <div className='motion-glow pointer-events-none absolute top-1/2 left-[-10%] h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-secondary/20 blur-[120px]' />
      <div className='motion-glow pointer-events-none absolute right-[-10%] bottom-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]' />

      <div className='container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20'>
        <div className='motion-visual w-full'>
          <div className='relative rounded-2xl border border-border bg-background/40 p-2 shadow-[0_32px_80px_-44px_color-mix(in_oklch,var(--foreground)_35%,transparent)] backdrop-blur-sm'>
            <div className='absolute top-4 right-4 z-20 rotate-6 md:-top-4 md:-right-4 md:rotate-3'>
              <div className='flex h-24 w-24 flex-col items-center justify-center rounded-4xl bg-primary p-4 text-primary-foreground shadow-lg ring-1 ring-border'>
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
                    <div className='relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-muted p-3 sm:p-4'>
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
              <CarouselPrevious className='left-4 border-border bg-background/80 text-foreground backdrop-blur-md hover:bg-background' />
              <CarouselNext className='right-4 border-border bg-background/80 text-foreground backdrop-blur-md hover:bg-background' />
            </Carousel>
          </div>
        </div>

        <div className='flex flex-col items-start px-4 lg:px-0'>
          <div className='motion-content mb-8 flex flex-wrap gap-3'>
            <BrandBadge
              tone='neutral'
              className='gap-2 border border-primary/25 px-4 py-2 text-xs font-semibold tracking-normal'
            >
              <Gift className='size-3.5 text-primary' />
              <span className='font-utekos-text text-primary'>
                Spar kr 200,-
              </span>
            </BrandBadge>
          </div>

          <h2 className='motion-content mb-6 text-4xl font-bold text-card-foreground sm:text-5xl lg:text-6xl'>
            Møt Utekos TechDown™
          </h2>

          <p className='motion-content mb-8 max-w-lg text-lg leading-relaxed text-card-foreground/90'>
            Vi har ikke bare kombinert det beste fra dunens
            letthet og mikrofiberens slitestyrke – vi har
            utviklet en helt ny kategori av personlig komfort.
          </p>

          <div className='motion-content mb-10 flex items-end gap-3 rounded-xl border border-border bg-background/20 p-4 backdrop-blur-sm'>
            <div className='flex flex-col'>
              <span className='mb-1 text-sm font-medium text-muted-foreground line-through'>
                Før 1990,-
              </span>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-bold text-card-foreground'>
                  1790,-
                </span>
                <span className='text-sm text-muted-foreground'>
                  inkl. mva
                </span>
              </div>
            </div>
            <div className='mx-2 h-8 w-px bg-border' />
            <div className='text-sm font-medium text-muted-foreground'>
              Spar 200,-
            </div>
          </div>

          <ul className='mb-10 w-full space-y-3'>
            {TechDownfeatures.map((feature, index) => (
              <li
                key={index}
                className='motion-feature-item group flex items-center gap-4 rounded-xl border border-transparent bg-background/15 transition-all duration-300 hover:translate-x-1 hover:border-border hover:bg-background/25'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary transition-transform group-hover:scale-110'>
                  <feature.icon className='h-5 w-5' />
                </div>
                <span className='font-utekos-text-medium text-card-foreground/90 transition-colors group-hover:text-card-foreground'>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <div className='motion-content'>
            <BrandBadge
              asChild
              tone='neutral'
              className='group h-14 bg-primary px-8 text-base text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover'
            >
              <Link
                href={'/produkter/utekos-techdown' as Route}
                data-track='TechDownProductPageSectionShopNowClick'
              >
                Benytt tilbudet nå
                <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
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
