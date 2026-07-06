// Path: src/app/skreddersy-varmen/components/LandingExpertReview.tsx
import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import {
  LANDING_AUTHOR_NAME,
  LANDING_EVIDENCE_ENTRIES,
  LANDING_LAST_UPDATED
} from '../data/landingSeoContent'

export async function LandingExpertReview() {
  'use cache'
  cacheLife('weeks')
  cacheTag(
    'skreddersy-varmen',
    'skreddersy-varmen-expert-review'
  )

  return (
    <article
      aria-labelledby='expert-review-heading'
      className='w-full bg-foreground dark:bg-dark-foreground px-6 py-16 text-background dark:text-dark-background md:px-12 md:py-24'
    >
      <div className='mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
        <div>
          <p className='mb-3 text-sm leading-4 font-medium text-background dark:text-dark-background'>
            Faglig vurdert av {LANDING_AUTHOR_NAME}
          </p>
          <h2
            id='expert-review-heading'
            className='max-w-[12ch] font-sans text-4xl leading-[0.95] font-bold tracking-normal text-background dark:text-dark-background md:text-5xl'
          >
            Derfor holder Utekos deg ute lenger
          </h2>
          <p className='leading-text-paragraph mt-5 max-w-xl text-base text-background/82 dark:text-dark-background/82 md:text-lg'>
            Sist oppdatert {LANDING_LAST_UPDATED}. Denne siden
            bygger på produktdata, kundeerfaringer,
            materialinformasjon og Utekos sine egne kjøpsguider.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          {LANDING_EVIDENCE_ENTRIES.map(entry => (
            <article
              key={entry.title}
              className='rounded-sm border border-background/12 dark:border-dark-background/12 bg-foreground-muted p-5 shadow-sm'
            >
              <h3 className='font-sans text-xl leading-[0.98] font-bold tracking-normal text-background dark:text-dark-background'>
                {entry.title}
              </h3>
              <p className='leading-text-paragraph mt-3 text-sm text-background/82 dark:text-dark-background/82'>
                {entry.answer}
              </p>
              <Link
                href={entry.href}
                className='mt-4 inline-flex text-sm font-semibold text-background dark:text-dark-background underline underline-offset-4 transition-colors hover:text-card dark:hover:text-dark-card'
              >
                {entry.linkLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </article>
  )
}
