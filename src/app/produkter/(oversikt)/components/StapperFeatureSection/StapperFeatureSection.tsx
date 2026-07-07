import StapperImage from '@public/stapper-hvit.png'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { PackageCheck } from 'lucide-react'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { IconRenderer } from './IconRenderer'
import { stapperFeatures } from './stapperFeatures'

export function StapperFeatureSection() {
  const imagePanel = (
    <Card className='relative isolate h-full min-h-88 overflow-hidden rounded-[1.75rem] border border-foreground/12 bg-foreground/[0.035] py-0 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_12%,transparent)] backdrop-blur-[2px] sm:min-h-112min-h-[34rem]'>
      <CardContent className='relative h-full min-h-[inherit] overflow-hidden p-0'>
        <div
          className='absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_oklab,var(--ancient-water)_18%,transparent),transparent_44%)]'
          aria-hidden='true'
        />

        <div
          className='absolute inset-x-10 bottom-8 h-24 rounded-full bg-background/55 blur-3xl dark:bg-dark-background/55'
          aria-hidden='true'
        />

        <div className='absolute top-5 left-5 z-10 hidden rounded-full border border-border bg-card/90 px-3.5 py-1.5 text-xs leading-none font-semibold tracking-[0.12em] text-card-foreground uppercase shadow-sm backdrop-blur sm:block'>
          Stapper™
        </div>

        <div className='absolute top-5 right-5 z-10 hidden rounded-full border border-border bg-card/90 px-3.5 py-1.5 text-xs leading-none font-semibold tracking-[0.12em] text-card-foreground uppercase shadow-sm backdrop-blur sm:block'>
          100 g
        </div>

        <Image
          src={StapperImage}
          alt='Utekos Stapper kompresjonsbag'
          fill
          className='object-contain p-8 drop-shadow-[0_30px_56px_rgba(8,10,24,0.42)] transition-transform duration-700 motion-safe:hover:scale-[1.03] sm:p-10 lg:p-12'
          sizes='(max-width: 640px) 88vw, (max-width: 1024px) 42rem, 38rem'
        />
      </CardContent>
    </Card>
  )

  return (
    <article className='relative mb-8 overflow-hidden rounded-[1.75rem] border border-foreground/12 bg-[radial-gradient(circle_at_14%_18%,color-mix(in_oklab,var(--ancient-water)_14%,transparent),transparent_30%),linear-gradient(135deg,var(--havdyp)_0%,var(--background)_48%,var(--havdyp)_100%)] py-8 sm:py-10 lg:py-12'>
      <div
        aria-hidden='true'
        className='absolute inset-0 -z-10'
        style={{
          background:
            'radial-gradient(circle at 78% 34%, color-mix(in oklab, var(--very-peri) 16%, transparent), transparent 42%)'
        }}
      />

      <div className='pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--foreground)_30%,transparent),transparent)]' />

      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 xl:gap-12'>
          <div className='w-full max-w-2xl justify-self-center text-left lg:justify-self-start'>
            <AnimatedBlock className='will-animate-fade-in-up'>
              <Badge
                variant='outline'
                className='mb-5 border-border bg-muted px-3.5 py-1.5 text-muted-foreground dark:bg-dark-muted dark:text-dark-muted-foreground'
              >
                Utekos Stapper™
              </Badge>
            </AnimatedBlock>

            <AnimatedBlock className='will-animate-fade-in-up'>
              <h2 className='max-w-[11ch] text-4xl leading-[0.96] font-bold tracking-[-0.045em] text-balance text-foreground sm:text-5xl lg:text-[4.35rem]'>
                Mer plass. Mindre stress.
              </h2>
            </AnimatedBlock>

            <AnimatedBlock
              className='will-animate-fade-in-up'
              delay='0.1s'
            >
              <p className='leading-text-paragraph mt-6 max-w-xl text-lg text-foreground/92'>
                Forvandle voluminøse jakker og soveposer til kompakte
                pakker. Utekos Stapper™ er den smarte løsningen for deg
                som verdsetter en effektiv og organisert bagasje på hytta,
                i bobilen eller i tursekken.
              </p>
            </AnimatedBlock>

            <AnimatedBlock className='will-animate-fade-in-up mt-8'>
              <BrandBadge
                asChild
                backgroundColor='var(--primary)'
                textColor='var(--primary-foreground)'
                className='group min-h-14 justify-center border border-primary/18 px-7 text-base shadow-[0_16px_36px_-24px_rgba(232,178,66,0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-105 dark:border-dark-primary/18 lg:justify-start'
              >
                <Link
                  href={'/produkter/utekos-stapper' as Route}
                  data-track='StapperFeatureSectionDiscoverClick'
                >
                  Oppdag Stapper™
                  <PackageCheck className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12' />
                </Link>
              </BrandBadge>
            </AnimatedBlock>
          </div>

          <AnimatedBlock
            className='will-animate-fade-in-scale w-full min-w-0'
            delay='0.2s'
            threshold={0.35}
          >
            {imagePanel}
          </AnimatedBlock>
        </div>

        <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4'>
          {stapperFeatures.map((feature, index) => (
            <AnimatedBlock
              key={feature.title}
              className='will-animate-fade-in-up h-full'
              delay={`${index * 0.08}s`}
            >
              <Card className='group/feature h-full overflow-hidden rounded-2xl border border-foreground/10 bg-background/68 py-0 text-foreground shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-background/82'>
                <CardContent className='flex h-full gap-4 p-5 sm:p-6 lg:p-5 xl:p-6'>
                  <div
                    className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover/feature:-translate-y-0.5 ${feature.colorClasses}`}
                  >
                    <IconRenderer
                      name={feature.icon}
                      className='size-5'
                    />
                  </div>

                  <div className='min-w-0'>
                    <h3 className='text-base leading-tight font-semibold tracking-[-0.015em] text-foreground'>
                      {feature.title}
                    </h3>
                    <p className='mt-2 text-sm leading-relaxed text-foreground/88'>
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedBlock>
          ))}
        </div>
      </div>
    </article>
  )
}