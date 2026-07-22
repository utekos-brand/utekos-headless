import Image from 'next/image'
import { PageSection } from '@/components/layout/PageSection'
import { COMFYROBE_TECHNICAL_FEATURES } from '../data/comfyrobeLandingContent'

const SHERPA_IMAGE =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Sherpa-1080x1350.png'

export function ComfyrobeTechnicalProofSection() {
  return (
    <PageSection
      id='teknologi'
      background='card'
      aria-labelledby='comfyrobe-technical-heading'
      contentClassName='lg:py-28'
    >
      <div className='grid items-start gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14'>
        <div className='lg:sticky lg:top-24'>
          <p className='font-utekos-text-medium text-sm uppercase tracking-[0.18em] text-card-foreground'>
            Bygget fra innsiden og ut
          </p>
          <h2
            id='comfyrobe-technical-heading'
            className='mt-4 font-sans text-3xl font-bold text-balance text-card-foreground sm:text-4xl lg:text-5xl'
          >
            Teknisk beskyttelse. Umiddelbar komfort.
          </h2>
          <p className='font-utekos-text mt-5 max-w-xl text-base leading-7 text-card-foreground sm:text-lg'>
            Comfyrobe™ kombinerer et beskyttende ytterlag med et
            lunt innerlag. Hver detalj har en tydelig oppgave: holde
            været ute, bevare varmen og gjøre plagget enkelt å bruke.
          </p>

          <div className='relative mt-8 aspect-4/5 overflow-hidden rounded-3xl border border-card-foreground/30 bg-background sm:mt-10'>
            <Image
              src={SHERPA_IMAGE}
              alt='Comfyrobe med det varme SherpaCore-fôret synlig.'
              fill
              sizes='(min-width: 1024px) 36vw, 100vw'
              className='object-cover object-center'
            />
          </div>
        </div>

        <ol className='grid gap-4 sm:grid-cols-2 lg:gap-5'>
          {COMFYROBE_TECHNICAL_FEATURES.map(
            ({ value, label, description }, index) => (
              <li
                key={label}
                className='min-h-64 rounded-3xl border border-card-foreground/30 bg-background p-6 text-foreground sm:p-7 lg:p-8'
              >
                <div className='flex items-start justify-between gap-4'>
                  <span className='font-sans text-4xl font-bold text-foreground sm:text-5xl'>
                    {value}
                  </span>
                  <span className='font-utekos-text-medium flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/30 text-sm text-foreground'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className='mt-8 font-sans text-2xl font-bold text-foreground'>
                  {label}
                </h3>
                <p className='font-utekos-text mt-3 text-base leading-7 text-foreground'>
                  {description}
                </p>
              </li>
            )
          )}
        </ol>
      </div>
    </PageSection>
  )
}
