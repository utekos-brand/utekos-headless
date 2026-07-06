import { KlarnaLogo } from '@/components/payments/KlarnaLogo'
import { VippsLogo } from '@/components/payments/VippsLogo'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { AboutBadge } from './AboutBadge'
import type { Route } from 'next'

const reassuranceItems = [
  'Skapt for norske forhold',
  'Fri frakt over 999,-'
]

export function AboutCta() {
  return (
    <article className=' bg-card py-20 text-card-foreground sm:py-28'>
      <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <div className='dark:border-dark-card/30 dark:bg-dark-secondary dark:text-dark-secondary-foreground rounded-3xl border border-card/30 bg-secondary p-8 text-center text-secondary-foreground sm:p-12'>
          <AboutBadge variant='on-secondary' className='mb-6'>
            Oppdag vår kolleksjon
          </AboutBadge>
          <h2 className='dark:text-dark-secondary-foreground text-4xl leading-tight font-semibold text-secondary-foreground sm:text-5xl'>
            Klar til å ta kvelden tilbake?
          </h2>
          <p className='dark:text-dark-secondary-foreground/80 mx-auto mt-5 max-w-2xl text-lg leading-8 text-secondary-foreground/80'>
            Opplev hvordan gjennomtenkt funksjon og tidløs
            komfort kan forvandle en kjølig kveld til ditt
            favorittøyeblikk.
          </p>

	          <Link
	            href={'/produkter' as Route}
	            data-track='AboutUsShopAllProductsClick'
            className='dark:focus-visible:outline-dark-ring bg-commerce-secondary dark:bg-dark-commerce-secondary text-commerce-secondary-foreground dark:text-dark-commerce-secondary-foreground hover:bg-commerce-secondary-hover dark:hover:bg-dark-commerce-secondary-hover hover:text-commerce-secondary-hover-foreground dark:hover:text-dark-commerce-secondary-hover-foreground mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-3xl px-8 py-4 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ring'
          >
            Se alle produkter
            <ArrowRight
              aria-hidden='true'
              className='size-5 text-current'
            />
          </Link>

          <div className='dark:text-dark-secondary-foreground mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-sm text-secondary-foreground'>
            {reassuranceItems.map(item => (
              <span
                key={item}
                className='inline-flex items-center gap-2'
              >
                <Check
                  aria-hidden='true'
                  className='size-4 text-current'
                />
                <span>{item}</span>
              </span>
            ))}
            <span className='inline-flex items-center gap-3'>
              <span>Trygg handel med</span>
              <VippsLogo
                aria-label='Vipps'
                className='h-4 w-auto'
              />
              <KlarnaLogo
                aria-label='Klarna'
                className='h-4 w-auto'
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
