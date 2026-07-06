import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { inspirationPages } from '../layout/inspirationPages'

export function InspirationPageCards() {
  return (
    <section
      aria-labelledby='inspirasjon-utforsk-temaer'
      className='overflow-x-clip border-t border-border bg-card py-16 text-card-foreground sm:py-20 lg:py-24'
    >
      <div className='container mx-auto w-full px-4 sm:px-6'>
        <div className='mb-10 w-full text-center sm:mb-12'>
          <h2
            id='inspirasjon-utforsk-temaer'
            className='mx-auto mb-4 w-full max-w-3xl text-3xl leading-tight font-bold text-balance text-card-foreground sm:text-4xl'
          >
            Utforsk inspirasjon etter situasjon
          </h2>
          <p className='mx-auto max-w-2xl text-base leading-relaxed text-card-foreground/90 sm:text-lg'>
            Finn ideer til situasjoner der komfort møter norsk
            natur. Velg temaet som passer deg best.
          </p>
        </div>
        <ul className='mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {inspirationPages.map(page => {
            const Icon = page.icon

            return (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className='group flex h-full flex-col rounded-lg border border-border bg-background p-6 text-foreground shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:border-secondary/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
                >
                  <div className='mb-4 flex items-start gap-4'>
                    <div className='flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground'>
                      <Icon className='size-5' aria-hidden='true' />
                    </div>
                    <div className='min-w-0'>
                      <h3 className='text-lg leading-snug font-bold text-foreground'>
                        {page.label}
                      </h3>
                      <p className='mt-1 text-sm leading-relaxed text-foreground/80'>
                        {page.description}
                      </p>
                    </div>
                  </div>
                  <span className='mt-auto inline-flex items-center gap-1 text-sm font-semibold text-secondary'>
                    Les mer
                    <ArrowRight
                      className='size-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0'
                      aria-hidden='true'
                    />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
