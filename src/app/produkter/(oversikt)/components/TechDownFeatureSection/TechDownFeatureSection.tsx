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
      className='dark:border-dark-foreground/10 relative my-24 overflow-hidden rounded-3xl border border-foreground/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-maritime-800)_82%,rgba(13,21,31,0.96))_0%,color-mix(in_oklch,var(--background)_92%,rgba(10,16,24,0.98))_52%,color-mix(in_oklch,var(--color-maritime-800)_84%,rgba(13,21,31,0.96))_100%)] py-16 md:my-32 md:py-24'
    >
      <div className='motion-glow bg-foreground-muted/12 pointer-events-none absolute top-1/2 left-[-10%] h-[600px] w-[600px] -translate-y-1/2 rounded-full blur-[120px]' />
      <div className='motion-glow bg-soft-warm/10 pointer-events-none absolute right-[-10%] bottom-0 h-[500px] w-[500px] rounded-full blur-[100px]' />

      <div className='container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20'>
        <div className='motion-visual w-full'>
          <div className='dark:border-dark-foreground/10 dark:bg-dark-foreground/4 relative rounded-2xl border border-foreground/10 bg-foreground/4 p-2 shadow-[0_32px_80px_-44px_rgba(8,15,24,0.92)] backdrop-blur-sm'>
            <div className='absolute top-4 right-4 z-20 rotate-6 md:-top-4 md:-right-4 md:rotate-3'>
              <div className='dark:bg-dark-primary dark:text-dark-background dark:ring-dark-background/8 flex h-24 w-24 flex-col items-center justify-center rounded-4xl bg-primary p-4 text-background shadow-[0_20px_45px_-24px_rgba(32,28,54,0.58)] ring-1 ring-background/8'>
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
                    <div className='dark:bg-dark-foreground/4 relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-foreground/4 p-3 sm:p-4'>
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
              <CarouselPrevious className='dark:border-dark-foreground/12 dark:bg-dark-background/72 dark:hover:bg-dark-background/88 hover:text-foreground-muted left-4 border-foreground/12 bg-background/72 text-foreground backdrop-blur-md hover:bg-background/88' />
              <CarouselNext className='dark:border-dark-foreground/12 dark:bg-dark-background/72 dark:hover:bg-dark-background/88 hover:text-foreground-muted right-4 border-foreground/12 bg-background/72 text-foreground backdrop-blur-md hover:bg-background/88' />
            </Carousel>
          </div>
        </div>

        <div className='flex flex-col items-start px-4 lg:px-0'>
          <div className='motion-content mb-8 flex flex-wrap gap-3'>
            <BrandBadge
              backgroundColor='var(--card)'
              textColor='var(--primary)'
              className='dark:border-dark-primary/24 gap-2 border border-primary/24 px-4 py-2 text-xs font-semibold tracking-normal shadow-[0_16px_30px_-24px_rgba(32,28,54,0.48)]'
            >
              <Gift className='dark:text-dark-primary h-3.5 w-3.5 text-primary' />
              <span className='font-utekos-text dark:text-dark-primary text-primary'>
                Spar kr 200,-
              </span>
            </BrandBadge>
          </div>

          <h2 className='motion-content mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl'>
            Møt Utekos <br />
            <span className='from-foreground-muted dark:via-dark-primary dark:to-dark-foreground bg-linear-to-r via-primary to-foreground bg-clip-text text-transparent'>
              TechDown™
            </span>
          </h2>

          <p className='motion-content /90 mb-8 max-w-lg text-lg leading-relaxed text-foreground/90'>
            Vi har ikke bare kombinert det beste fra dunens
            letthet og mikrofiberens slitestyrke – vi har
            utviklet en helt ny kategori av personlig komfort.
          </p>

          <div className='motion-content dark:border-dark-foreground/10 dark:bg-dark-foreground/5 mb-10 flex items-end gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm'>
            <div className='flex flex-col'>
              <span className='text-foreground-muted/58 mb-1 text-sm font-medium line-through'>
                Før 1990,-
              </span>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-bold text-foreground'>
                  1790,-
                </span>
                <span className='text-foreground-muted/62 text-sm'>
                  inkl. mva
                </span>
              </div>
            </div>
            <div className='dark:bg-dark-foreground/10 mx-2 h-8 w-px bg-foreground/10'></div>
            <div className='text-foreground-muted text-sm font-medium'>
              Spar 200,-
            </div>
          </div>

          <ul className='mb-10 w-full space-y-3'>
            {TechDownfeatures.map((feature, index) => (
              <li
                key={index}
                className='motion-feature-item group dark:bg-dark-foreground/3 dark:hover:border-dark-foreground/14 dark:hover:bg-dark-foreground/8 flex items-center gap-4 rounded-xl border border-transparent bg-foreground/3 transition-all duration-300 hover:translate-x-1 hover:border-foreground/14 hover:bg-foreground/8'
              >
                <div className='bg-foreground-muted/12 text-foreground-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110'>
                  <feature.icon className='h-5 w-5' />
                </div>
                <span className='font-utekos-text-medium /90 dark:group-hover:text-dark-foreground text-foreground/90 transition-colors group-hover:text-foreground'>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <div className='motion-content'>
            <BrandBadge
              asChild
              backgroundColor='var(--color-primary)'
              textColor='var(--color-background)'
              className='group h-14 px-8 text-base shadow-[0_20px_46px_-28px_rgba(20,30,40,0.56)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-95'
            >
              <Link
                href={'/produkter/utekos-techdown' as Route}
                data-track='TechDownProductPageSectionShopNowClick'
              >
                Benytt tilbudet nå
                <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
              </Link>
            </BrandBadge>
            <p className='text-foreground-muted/70 mt-4 text-xs'>
              *Tilbudet gjelder i en begrenset periode.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
