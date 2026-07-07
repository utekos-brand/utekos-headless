// Path: src/app/handlehjelp/sammenlign-modeller/components/ConclusionSection.tsx
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import Link from 'next/link'
import { faqItems } from '../utils/comparisonData'

export function ConclusionSection() {
  return (
    <article className='bg-background py-20 text-foreground sm:py-28'>
      <div className='mx-auto max-w-7xl px-[6vw]'>
        <div className='grid gap-12 lg:grid-cols-[0.45fr_0.55fr] lg:items-start'>
          <div>
            <BrandBadge
              label='Klar for å velge'
              tone='featured'
              className='mb-6 px-6 py-3 text-sm'
            />
            <h2 className='font-sans text-4xl leading-[0.95] font-bold tracking-[-0.01em] text-foreground sm:text-6xl'>
              Et trygt valg på under ett minutt
            </h2>
            <p className='leading-text-paragraph text-foreground/90 mt-6 text-lg text-foreground/90 sm:text-xl'>
              TechDown gir mest ro i skiftende vær. Dun gir mest
              varme per gram. Mikrofiber er lettest å pakke og
              vaske.
            </p>
            <div className='mt-9 flex flex-wrap gap-4'>
              <BrandBadge
                asChild
                tone='neutral'
                className='px-7 py-4 text-base transition-transform duration-300 hover:scale-[1.02]'
              >
                <Link
                  href='/produkter'
                  data-track='SammenlignModellerConclusionAllProductsClick'
                >
                  Se hele kolleksjonen
                </Link>
              </BrandBadge>
              <BrandBadge
                asChild
                tone='secondary'
                className='px-7 py-4 text-base transition-transform duration-300 hover:scale-[1.02]'
              >
                <Link
                  href='/kontaktskjema'
                  data-track='SammenlignModellerConclusionContactClick'
                >
                  Få råd fra oss
                </Link>
              </BrandBadge>
            </div>
          </div>

          <div
            data-nosnippet
            className='divide-foreground/20 border-foreground/20 divide-y divide-foreground/20 border-y border-foreground/20'
          >
            {faqItems.map(item => (
              <details
                key={item.question}
                className='group py-6'
              >
                <summary className='cursor-pointer list-none font-sans text-xl leading-[1.05] font-bold tracking-[-0.01em] text-foreground marker:hidden'>
                  <span className='inline-flex w-full items-center justify-between gap-6'>
                    {item.question}
                    <span className='text-foreground/90 text-2xl leading-none text-foreground/90 transition-transform duration-300 group-open:rotate-45'>
                      +
                    </span>
                  </span>
                </summary>
                <p
                  data-nosnippet
                  className='leading-text-paragraph text-foreground/90 mt-4 max-w-2xl text-base text-foreground/90'
                >
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
