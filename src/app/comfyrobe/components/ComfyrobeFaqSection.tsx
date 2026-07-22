import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageSection } from '@/components/layout/PageSection'
import { COMFYROBE_FAQS } from '../data/comfyrobeLandingContent'

export function ComfyrobeFaqSection() {
  return (
    <PageSection
      id='sporsmal-og-svar'
      background='muted'
      aria-labelledby='comfyrobe-faq-heading'
    >
      <div className='grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14'>
        <div>
          <p className='font-utekos-text-medium text-sm uppercase tracking-[0.18em] text-foreground'>
            Før du bestemmer deg
          </p>
          <h2
            id='comfyrobe-faq-heading'
            className='mt-4 font-sans text-3xl font-bold text-balance text-foreground sm:text-4xl lg:text-5xl'
          >
            Spørsmål og tydelige svar
          </h2>
          <p className='font-utekos-text mt-5 max-w-lg text-base leading-7 text-foreground sm:text-lg'>
            Produktvalg skal være enkelt. Her finner du svar på det
            kundene oftest trenger å vite før bestilling.
          </p>
          <p className='font-utekos-text mt-6 text-sm leading-6 text-foreground'>
            Se også{' '}
            <Link
              href='/frakt-og-retur'
              className='font-utekos-text-medium underline decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
            >
              frakt, betaling og retur
            </Link>
            .
          </p>
        </div>

        <div className='divide-y divide-foreground/30 border-y border-foreground/30'>
          {COMFYROBE_FAQS.map(({ question, answer }) => (
            <details key={question} className='group'>
              <summary className='font-utekos-text-medium flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-base text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-lg [&::-webkit-details-marker]:hidden'>
                <span>{question}</span>
                <span className='flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/40'>
                  <Plus
                    className='size-5 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none'
                    aria-hidden='true'
                  />
                </span>
              </summary>
              <p className='font-utekos-text max-w-3xl pb-6 pr-12 text-base leading-7 text-foreground'>
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </PageSection>
  )
}
