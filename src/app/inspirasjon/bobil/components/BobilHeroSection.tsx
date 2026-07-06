import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationHeroBreadcrumb } from '@/app/inspirasjon/layout/InspirationHeroBreadcrumb'
import { H1 } from '@/components/typography/TypographyH1'
import { Lead } from '@/components/typography/Lead'

export function BobilHeroSection() {
  return (
    <article className='relative isolate overflow-x-clip border-b border-border bg-background text-foreground'>
      <InspirationContentShell className='relative z-10 py-8 sm:py-10'>
        <div className='flex min-w-0 flex-col items-start gap-2 text-left md:gap-4'>
          <InspirationHeroBreadcrumb label='Bobil' />
          <H1
            Text='Forleng bobilsesongen med Utekos'
            ID='bobil-hero-h1'
            className='max-w-4xl pt-4 text-4xl text-balance sm:text-5xl md:pt-6 lg:pt-8 lg:text-6xl xl:text-6xl'
          />
          <Lead
            Text='Fra kjølige morgener til sosiale kvelder - oppdag hvordan Utekos blir din beste følgesvenn på bobilturen.'
            className='max-w-3xl'
          />
        </div>
      </InspirationContentShell>
    </article>
  )
}
