// Path: src/app/produkter/(oversikt)/components/ComfyrobeFeatureSection.tsx

import Link from 'next/link'
import type { Route } from 'next'
import type { CSSProperties } from 'react'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { Button } from '@/components/ui/button'
import { LazyComfyrobeImageCarousel } from '@/app/produkter/(oversikt)/components/LazyComfyrobeImageCarousel'
import { ArrowRight, Wind } from 'lucide-react'
import { comfyrobeFeatures } from '@/app/produkter/(oversikt)/utils/comfyrobeFeatures'

const featureSurfaceStyles = {
  weather: {
    background: 'var(--card)',
    border: 'var(--ceramic)',
    iconBackground: 'var(--foreground)',
    iconBorder: 'var(--card)',
    iconColor: 'var(--ceramic)'
  },
  warmth: {
    background: 'var(--card)',
    border: 'var(--ceramic)',
    iconBackground: 'var(--foreground)',
    iconBorder: 'var(--card)',
    iconColor: 'var(--ceramic)'
  },
  freedom: {
    background: 'var(--card)',
    border: 'var(--ceramic)',
    iconBackground: 'var(--foreground)',
    iconBorder: 'var(--card)',
    iconColor: 'var(--ceramic)'
  }
} as const

export function ComfyrobeFeatureSection() {
  return (
    <article
      aria-labelledby='comfyrobe-feature-heading'
      className='w-full py-16 sm:py-24 md:mb-24'
    >
      <div className='container mx-auto px-4'>
        <div className='border-ceramic bg-background relative overflow-hidden rounded-[1.75rem] border bg-background p-5 shadow-[0_28px_90px_-62px_color-mix(in_oklch,var(--background)_90%,transparent)] sm:p-8 lg:p-12'>
          <div className='pointer-events-none absolute inset-0 opacity-70'>
            <div
              className='size-136rounded-full absolute top-0 -left-24 blur-3xl'
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--card) 42%, transparent) 0%, transparent 70%)'
              }}
            />
            <div
              className='absolute -right-24 bottom-0 size-136 rounded-full blur-3xl'
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--card) 38%, transparent) 0%, transparent 72%)'
              }}
            />
            <div
              className='absolute top-1/2 left-1/2 size-120 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl'
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--background) 28%, transparent) 0%, transparent 74%)'
              }}
            />
          </div>

          <div className='relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-12'>
            <LazyComfyrobeImageCarousel />

            <AnimatedBlock className='will-animate-fade-in-right h-full min-h-full'>
              <div className='flex h-full min-h-full flex-col justify-center lg:min-h-152'>
                <div>
                  <AnimatedBlock className='will-animate-fade-in-up'>
                    <BrandBadge
                      backgroundColor='var(--card)'
                      textColor='var(--foreground)'
                      className='border-secondary mb-5 gap-2 border px-4 py-2 text-sm font-medium shadow-[0_16px_34px_-28px_color-mix(in_oklch,var(--secondary)_68%,transparent)]'
                    >
                      <Wind
                        className='text-ceramic size-4'
                        aria-hidden='true'
                      />
                      <span>Comfyrobe™</span>
                    </BrandBadge>
                  </AnimatedBlock>

                  <AnimatedBlock
                    className='will-animate-fade-in-up'
                    delay='0.05s'
                  >
                    <h2
                      id='comfyrobe-feature-heading'
                      className='max-w-2xl font-sans text-3xl leading-[0.95] font-bold text-balance text-foreground sm:text-4xl lg:text-5xl'
                    >
                      Forleng utekosen.
                      <br />
                      <span className='text-heading-secondary text-heading-secondary'>
                        Uansett vær.
                      </span>
                    </h2>
                  </AnimatedBlock>

                  <AnimatedBlock
                    className='will-animate-fade-in-up'
                    delay='0.1s'
                  >
                    <p className='leading-text-paragraph text-foreground/88 mt-6 max-w-2xl text-lg text-foreground/88'>
                      Comfyrobe™ er den ultimate allværskåpen for
                      livsnyteren. Den kombinerer den urokkelige
                      beskyttelsen til en teknisk skalljakke med
                      den komfortable omfavnelsen av din mykeste
                      badekåpe.
                    </p>
                  </AnimatedBlock>

                  <div className='mt-8 w-full space-y-3'>
                    {comfyrobeFeatures.map((feature, index) => {
                      const surface =
                        featureSurfaceStyles[feature.surface]
                      const Icon = feature.icon

                      return (
                        <AnimatedBlock
                          key={feature.title}
                          className='will-animate-fade-in-up'
                          delay={`${0.2 + index * 0.1}s`}
                        >
                          <article
                            className='group relative overflow-hidden rounded-[1.05rem] border p-4 shadow-[0_18px_44px_-36px_color-mix(in_oklch,var(--background)_86%,transparent)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
                            style={
                              {
                                '--feature-accent':
                                  surface.iconColor,
                                'borderColor': surface.border,
                                'background': surface.background
                              } as CSSProperties
                            }
                          >
                            <div
                              className='pointer-events-none absolute -inset-x-8 -top-20 h-44 opacity-[0.14] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.22]'
                              style={{
                                background:
                                  'radial-gradient(120% 120% at 50% 0%, transparent 38%, var(--feature-accent) 100%)'
                              }}
                            />

                            <div className='relative z-10 min-h-17'>
                              <div className='flex items-center gap-3'>
                                <div
                                  className='flex size-9 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:size-10 lg:size-11 lg:rounded-xl'
                                  style={{
                                    borderColor:
                                      surface.iconBorder,
                                    background:
                                      surface.iconBackground
                                  }}
                                >
                                  <Icon
                                    className='size-4 lg:size-5'
                                    style={{
                                      color: surface.iconColor
                                    }}
                                    aria-hidden='true'
                                  />
                                </div>

                                <h3 className='text-base leading-[1.2] font-semibold text-foreground'>
                                  {feature.title}
                                </h3>
                              </div>

                              <p className='leading-text-paragraph text-foreground/78 mt-3 text-sm text-foreground/78 sm:mt-2'>
                                {feature.description}
                              </p>
                            </div>
                          </article>
                        </AnimatedBlock>
                      )
                    })}
                  </div>

                  <AnimatedBlock
                    className='will-animate-fade-in-up'
                    delay='0.5s'
                  >
                    <div className='mt-8 flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center'>
                      <p className='font-sans text-4xl leading-none font-bold text-foreground'>
                        NOK 990,-
                      </p>

                      <Button
                        asChild
                        variant='default'
                        size='lg'
                        className='group min-h-12 w-full gap-2 rounded-full px-6 py-3 text-base leading-[1.35] font-semibold whitespace-normal shadow-[0_18px_40px_-28px_color-mix(in_oklch,var(--primary)_70%,transparent)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:whitespace-nowrap'
                      >
                        <Link
                          href={'/produkter/comfyrobe' as Route}
                          data-track='ComfyrobeExploreProductPageClick'
                        >
                          Utforsk Comfyrobe™
                          <ArrowRight className='ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none' />
                        </Link>
                      </Button>
                    </div>
                  </AnimatedBlock>
                </div>
              </div>
            </AnimatedBlock>
          </div>
        </div>
      </div>
    </article>
  )
}
