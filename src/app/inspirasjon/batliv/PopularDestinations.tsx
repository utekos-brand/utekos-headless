import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { MapPinIcon } from 'lucide-react'

interface Destination {
  name: string
  season: string
  highlight: string
}

export const popularDestinationsData: Destination[] = [
  {
    name: 'Sørlandskysten',
    season: 'Sommer',
    highlight: 'For sene kvelder i uthavn'
  },
  {
    name: 'Vestlandskysten',
    season: 'Vår/Sommer',
    highlight: 'Perfekt i uforutsigbart vær'
  },
  {
    name: 'Oslofjorden',
    season: 'Vår/Høst',
    highlight: 'Forleng pendlersesongen'
  },
  {
    name: 'Helgelandskysten',
    season: 'Sommer',
    highlight: 'For lyse, men kjølige netter'
  }
]

export function PopularDestinations({
  destinations
}: {
  destinations: Destination[]
}) {
  return (
    <article
      id='populære-destinasjoner'
      className='overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24'
    >
      <InspirationContentShell>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 lg:max-w-4xl'>
          <H2
            ID='batliv-destinasjoner'
            Text='Populære destinasjoner med Utekos'
            className='text-card-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-card-foreground md:mt-6 md:pb-0 lg:pb-0'>
            Norges vakreste kyststrekninger venter — nyt dem i komfort hele
            sesongen.
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
              <Card className='h-full rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'>
                <CardContent className='p-6'>
                  <div className='mb-3 flex items-start justify-between gap-3'>
                    <h3 className='text-lg font-semibold text-foreground'>
                      {destination.name}
                    </h3>
                    <MapPinIcon
                      className='size-5 shrink-0 text-secondary-foreground'
                      aria-hidden='true'
                    />
                  </div>
                  <P className='mb-2 text-sm text-muted-foreground not-first:mt-0'>
                    {destination.season}
                  </P>
                  <P className='text-sm leading-relaxed text-foreground/80 not-first:mt-0'>
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
