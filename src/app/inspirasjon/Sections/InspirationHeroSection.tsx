import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { inspirationPages } from '../layout/inspirationPages'

export function InspirationPageCards() {
  return (
    <section
      aria-labelledby='inspirasjon-utforsk-temaer'
      className='overflow-x-clip border-t border-border bg-card py-16 text-card-foreground sm:py-20 lg:py-24'
    >
      <InspirationContentShell>
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

        <ul className='mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {inspirationPages.map(page => {
            const Icon = page.icon

            return (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className='group/link block rounded-3xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none'
                  aria-label={`${page.label}: ${page.description}`}
                >
                  <InspirationFeatureCard
                    density='compact'
                    footerMode='flow'
                    icon={Icon}
                    title={page.label}
                    description={page.description}
                    footer={
                      <span className='inline-flex w-full items-center justify-between gap-4 text-sm leading-none font-semibold tracking-[-0.01em] text-foreground'>
                        <span>Les mer</span>
                        <ArrowRight
                          className='size-4 transition-transform duration-300 group-hover/link:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0'
                          aria-hidden='true'
                        />
                      </span>
                    }
                    backgroundSlot={
                      <>
                        <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--foreground)_5%,transparent),transparent_44%)]' />
                        <div className='absolute inset-x-0 top-0 h-px bg-foreground/10' />
                        <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-80 blur-3xl transition-opacity duration-300 group-hover/link:opacity-100' />
                      </>
                    }
                    className='h-auto min-h-0 border-border bg-background text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'
                    headerClassName='gap-4 px-5 pt-5 sm:px-6 sm:pt-6'
                    iconContainerClassName='size-10 rounded-lg border-border bg-secondary text-secondary-foreground ring-border/50'
                    iconClassName='size-5'
                    titleClassName='min-h-0 text-left text-lg leading-snug font-bold tracking-[-0.02em] text-foreground'
                    contentClassName='px-5 pt-3 pb-4 sm:px-6'
                    descriptionClassName='max-w-[30ch] text-sm leading-relaxed text-foreground/80'
                    footerClassName='border-border bg-muted/30 px-5 py-3.5 sm:px-6'
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </InspirationContentShell>
    </section>
  )
}
