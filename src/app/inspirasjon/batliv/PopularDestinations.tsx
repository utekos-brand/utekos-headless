import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { MapPinIcon } from 'lucide-react'
import type { StaticImageData } from 'next/image'

import Oslofjorden from '@public/Oslofjorden-1920x1080.jpg'
import Vestlandskysten from '@public/Vestlandskysten-1920x1080.png'
import Sørlandskysten from '@public/Sorlandskysten-1920x1080.jpg'
import Helgelandskysten from '@public/Helgelandskysten-1920x1080.jpg'

interface Destination {
  name: string
  season: string
  highlight: string
}

const destinationImages: Record<string, StaticImageData> = {
  Sørlandskysten,
  Vestlandskysten,
  Oslofjorden,
  Helgelandskysten
}

function getDestinationImage(destination: Destination) {
  return destinationImages[destination.name] ?? Oslofjorden
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
      className='overflow-x-clip bg-surface-neutral py-16 text-card-foreground sm:py-20 lg:py-24'
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

        <div className='grid auto-rows-fr grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {destinations.map((destination, destinationIndex) => {
            const image = getDestinationImage(destination)

            return (
              <AnimatedBlock
                key={destination.name}
                className='will-animate-fade-in-up h-full'
                delay={`${destinationIndex * 0.1}s`}
                threshold={0.2}
              >
                <InspirationFeatureCard
                  density='media'
                  footerMode='bottom'
                  image={image}
                  imageAlt={`${destination.name} som båtdestinasjon med Utekos`}
                  imageAspect='16/10'
                  icon={MapPinIcon}
                  title={destination.name}
                  description={destination.highlight}
                  footerLabel='Sesong'
                  footerValue={destination.season}
                  backgroundSlot={
                    <>
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card-foreground)_5%,transparent),transparent_44%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-card-foreground/12' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-75 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
                    </>
                  }
                  className='border-border bg-background text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'
                  headerClassName='gap-4 px-6 pt-6 sm:px-7 sm:pt-7'
                  iconContainerClassName='size-11 rounded-lg border-border bg-secondary text-secondary-foreground ring-border/50'
                  iconClassName='size-5'
                  titleClassName='text-left text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground md:text-2xl'
                  contentClassName='px-6 pt-5 pb-5 sm:px-7'
                  descriptionClassName='max-w-[32ch] text-sm leading-relaxed text-foreground/80'
                  footerClassName='border-border bg-muted/30 px-6 py-4 sm:px-7'
                  footerLabelClassName='text-foreground/90'
                  footerValueClassName='text-light'
                />
              </AnimatedBlock>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}