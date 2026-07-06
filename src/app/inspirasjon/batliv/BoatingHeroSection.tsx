import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationHeroBreadcrumb } from '@/app/inspirasjon/layout/InspirationHeroBreadcrumb'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { H1 } from '@/components/typography/TypographyH1'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { boatingHeroFeatures } from './boatingHeroFeatures'

export function BoatingHeroSection() {
  return (
    <section
      aria-labelledby='batliv-hero-title'
      className='relative isolate overflow-x-clip border-b border-border bg-background text-foreground'
    >
      <InspirationContentShell className='relative z-10 py-8 sm:py-10'>
        <div className='flex min-w-0 flex-col items-start gap-2 md:gap-4'>
          <div className='w-full min-w-0'>
            <InspirationHeroBreadcrumb label='Båtliv' />
            <H1
              ID='batliv-hero-title'
              Text='Båtliv uten å fryse'
              className='max-w-4xl pt-4 text-4xl text-balance sm:text-5xl md:pt-6 lg:pt-8 lg:text-6xl xl:text-6xl'
            />
            <Lead className='mt-6 max-w-3xl'>
              Fra den første kaffen i soloppgang til ankerdrammen under
              stjernene. Opplev en lengre og mer komfortabel båtsesong med
              varme som varer.
            </Lead>

            <div className='mt-8 flex flex-wrap gap-3 sm:mt-9 sm:gap-4'>
              <BrandBadge
                asChild
                backgroundColor='var(--primary)'
                textColor='var(--primary-foreground)'
                className='group min-h-12 border border-transparent px-6 py-3 text-base leading-4 font-bold transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0'
              >
                <Link href='/produkter'>
                  Se produkter for båtfolket
                  <ArrowRight className='ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0' />
                </Link>
              </BrandBadge>
              <BrandBadge
                asChild
                backgroundColor='var(--secondary)'
                textColor='var(--secondary-foreground)'
                className='min-h-12 border border-border px-6 py-3 text-base leading-4 font-bold transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0'
              >
                <Link href='#bruksomrader'>Utforsk mulighetene</Link>
              </BrandBadge>
            </div>
          </div>

          <div
            className='mt-10 grid w-full gap-3 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3'
            aria-label='Høydepunkter for båtliv med Utekos'
          >
            {boatingHeroFeatures.map(feature => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className='rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground'>
                      <Icon className='size-5' aria-hidden='true' />
                    </div>
                    <div className='min-w-0 pt-0.5'>
                      <H3
                        Text={feature.title}
                        className='pb-0 text-lg leading-snug text-card-foreground sm:text-xl'
                      />
                      <P className='mt-2 text-left text-sm leading-relaxed text-card-foreground/80 not-first:mt-2'>
                        {feature.description}
                      </P>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </InspirationContentShell>
    </section>
  )
}
