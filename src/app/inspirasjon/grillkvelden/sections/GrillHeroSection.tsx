import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationHeroBreadcrumb } from '@/app/inspirasjon/layout/InspirationHeroBreadcrumb'
import { H1 } from '@/components/typography/TypographyH1'
import { Lead } from '@/components/typography/Lead'

export function GrillHeroSection() {
  return (
    <article className='relative isolate overflow-x-clip border-b border-border bg-background text-foreground'>
      <InspirationContentShell className='relative z-10 py-8 sm:py-10'>
        <div className='flex min-w-0 flex-col items-start gap-2 md:gap-4'>
          <InspirationHeroBreadcrumb label='Grillkvelden' />
          <H1
            ID='grillkvelden-som-aldri-tar-slutt'
            Text='Grillkvelden som aldri tar slutt'
            className='max-w-4xl pt-4 text-4xl text-balance sm:text-5xl md:pt-6 lg:pt-8 lg:text-6xl xl:text-6xl'
          />
          <Lead className='max-w-3xl'>
            Bli verten for de uforglemmelige kveldene, der de gode
            samtalene og latteren fortsetter lenge etter at den
            siste pølsen er grillet.
          </Lead>
        </div>
      </InspirationContentShell>
    </article>
  )
}
