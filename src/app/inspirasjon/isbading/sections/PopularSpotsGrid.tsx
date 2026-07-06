// Path: src/app/inspirasjon/isbading/sections/PopularSpotsGrid.tsx

import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { MapPinIcon } from 'lucide-react'
import type { Destination } from '../types'

export const popularSpotsData: Destination[] = [
  {
    name: 'Oslofjorden & Sauna',
    season: 'Hele året',
    highlight: 'Kombinasjon av badstu og fjord',
    color: 'text-ceramic'
  },
  {
    name: 'Lofoten & Arktis',
    season: 'Vinter',
    highlight: 'Det ultimate isbadet i nordlys',
    color: 'text-secondary-foreground'
  },
  {
    name: 'Fjellvann & Innlandet',
    season: 'Vinter/Vår',
    highlight: 'Hugg hull i isen for stillhet',
    color: 'text-secondary-foreground'
  },
  {
    name: 'Vestlandskysten',
    season: 'Høst/Vinter',
    highlight: 'Røft vær og friskt hav',
    color: 'text-muted-foreground'
  }
]

export function PopularSpotsGrid({
  destinations
}: {
  destinations: Destination[]
}) {
  return (
    <article className='overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16'>
          <H2
            ID='isbading-popular-spots'
            Text='Hvor tar du ditt neste dykk?'
            className='text-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-muted-foreground md:mt-6 md:pb-0 lg:pb-0'>
            Fra urbane badstuer til øde fjellvann – Utekos er med deg der
            vannet er kaldt.
          </Lead>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {destinations.map((destination, destinationIndex) => (
            <AnimatedBlock
              key={destination.name}
              className='will-animate-fade-in-up'
              delay={`${destinationIndex * 0.1}s`}
              threshold={0.2}
            >
              <Card className='h-full border border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-muted/40 motion-reduce:transition-none'>
                <CardContent className='p-6'>
                  <div className='mb-3 flex items-start justify-between gap-3'>
                    <H3
                      Text={destination.name}
                      className='pb-0 text-left text-lg leading-snug text-card-foreground'
                    />
                    <MapPinIcon
                      className={`size-5 shrink-0 ${destination.color}`}
                      aria-hidden='true'
                    />
                  </div>
                  <P className='mb-2 text-sm text-muted-foreground not-first:mt-0'>
                    {destination.season}
                  </P>
                  <P className='text-sm text-card-foreground/80 not-first:mt-0'>
                    {destination.highlight}
                  </P>
                </CardContent>
              </Card>
            </AnimatedBlock>
          ))}
        </div>
      </InspirationContentShell>
    </article>
  )
}
