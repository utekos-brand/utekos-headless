// Path: src/app/inspirasjon/isbading/sections/BenefitsGrid.tsx

import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { Shield, Shirt, Thermometer, Wind } from 'lucide-react'
import type { Benefit } from '../types'

export const benefitsData: Benefit[] = [
  {
    icon: Thermometer,
    title: 'Gjenopprett varmen',
    description:
      'Absorberende fôr tørker huden og får opp kroppstemperaturen umiddelbart.',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  },
  {
    icon: Shirt,
    title: 'Ditt mobile skifterom',
    description:
      'Romslig nok til at du enkelt trekker armene inn og skifter diskret på stranden.',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  },
  {
    icon: Wind,
    title: '100% vindtett',
    description:
      'Blokkerer den iskalde trekken som ellers stjeler varmen din etter badet.',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  },
  {
    icon: Shield,
    title: 'Robust beskyttelse',
    description:
      'Tåler røft vær, snø og sludd mens du nyter endorfinrusen.',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  }
]

export function BenefitsGrid({
  benefits
}: {
  benefits: Benefit[]
}) {
  return (
    <article className='overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24'>
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16'>
          <H2
            ID='isbading-benefits'
            Text='Spesiallaget for det ekstreme'
            className='text-card-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-card-foreground/90 md:mt-6 md:pb-0 lg:pb-0'>
            Isbading krever utstyr du kan stole på. Vi har fjernet barrierene
            slik at du kan fokusere på opplevelsen.
          </Lead>
        </div>
        <div className='grid grid-cols-1 gap-6 rounded-3xl bg-background p-6 text-foreground md:grid-cols-2 md:gap-8 md:p-8 xl:grid-cols-4'>
          {benefits.map((benefit, benefitIndex) => {
            const Icon = benefit.icon
            const iconBackgroundClass = benefit.bgColor ?? 'bg-muted'

            return (
              <AnimatedBlock
                key={benefit.title}
                className='will-animate-fade-in-scale text-center'
                delay={`${benefitIndex * 0.05}s`}
                threshold={0.2}
              >
                <div className='h-full rounded-lg border border-border bg-card p-6 text-left text-card-foreground shadow-sm sm:p-7'>
                  <div className='mb-5 flex flex-col items-center gap-4 sm:mb-6'>
                    <div
                      className={`${iconBackgroundClass} flex size-16 items-center justify-center rounded-full border border-border`}
                    >
                      <Icon
                        className={`size-8 ${benefit.color}`}
                        aria-hidden='true'
                      />
                    </div>
                    <H3
                      Text={benefit.title}
                      className='pb-0 text-center text-xl leading-snug text-card-foreground sm:text-2xl'
                    />
                  </div>
                  <P className='text-center text-base leading-relaxed text-card-foreground/80 not-first:mt-0'>
                    {benefit.description}
                  </P>
                </div>
              </AnimatedBlock>
            )
          })}
        </div>
      </div>
    </article>
  )
}
