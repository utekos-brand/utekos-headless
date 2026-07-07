import type { CSSProperties } from 'react'
import Image, { type StaticImageData } from 'next/image'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import type { Destination } from '../types'
import { bobilDestinationCardTheme as theme } from '../utils/destinationCardThemes'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { cn } from '@/lib/utils/className'

import Hardangervidda from '@public/Hardangervidda-960x540.jpg'
import BobilLofoten from '@public/BobilLofoten-960x540.jpg'
import Geirangerfjorden from '@public/Geirangerfjorden-960x540.jpg'
import Atlanterhavsveien from '@public/Atlanterhavsveien-960x540.jpg'

const destinationImages: Record<string, StaticImageData> = {
  Lofoten: BobilLofoten,
  Geirangerfjorden,
  Hardangervidda,
  Atlanterhavsveien
}

function getDestinationImage(destination: Destination) {
  return destinationImages[destination.name] ?? Atlanterhavsveien
}

export function DestinationsGrid({
  destinations
}: {
  destinations: Destination[]
}) {
  return (
    <article className='card overflow-x-clip bg-muted py-16 text-card-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <div className='mb-6 md:mb-8 lg:mb-10'>
          <H2
            Text='Populære destinasjoner med Utekos'
            ID='populære-destinasjoner-med-utekos'
            className='text-card-foreground'
          />
          <Lead
            Text='Norges vakreste bobildestinasjoner venter — nyt dem i komfort hele sesongen'
            className='text-card-foreground'
          />
        </div>

        <div className='grid auto-rows-fr grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {destinations.map((destination, destinationIndex) => {
            const Icon = destination.icon
            const image = getDestinationImage(destination)

            return (
              <AnimatedBlock
                key={destination.name}
                className='will-animate-fade-in-up h-full'
                delay={`${destinationIndex * 0.08}s`}
                rootMargin='0px 0px -8% 0px'
                threshold={0.18}
              >
                <Card
                  size='sm'
                  className={cn(
                    'group relative isolate flex h-full min-h-96 overflow-hidden rounded-3xl border p-0 shadow-[0_24px_80px_-52px_color-mix(in_oklch,var(--foreground)_72%,transparent)] ring-1 ring-foreground/10 transition-all duration-300 ease-out [--card-spacing:0rem] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_32px_96px_-56px_color-mix(in_oklch,var(--foreground)_86%,transparent)]',
                    theme.border,
                    theme.surface,
                    theme.text
                  )}
                  style={
                    {
                      '--season-fg': theme.badgeText
                    } as CSSProperties
                  }
                >
                  <div className='relative aspect-16/10 w-full overflow-hidden'>
                    <Image
                      src={image}
                      alt={`${destination.name} som bobildestinasjon`}
                      fill
                      placeholder='blur'
                      sizes='(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw'
                      className='object-cover object-center transition-transform duration-700 ease-out motion-safe:group-hover:scale-105'
                    />

                    <div
                      className='absolute inset-0 bg-[linear-gradient(180deg,transparent_34%,color-mix(in_oklch,var(--card)_82%,transparent)_100%)]'
                      aria-hidden='true'
                    />

                    <div
                      className='absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklch,var(--foreground)_20%,transparent),transparent_38%)] opacity-70'
                      aria-hidden='true'
                    />

                    <div
                      className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-foreground/20'
                      aria-hidden='true'
                    />
                  </div>

                  <div
                    className='pointer-events-none absolute inset-0 z-0'
                    aria-hidden='true'
                  >
                    <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--foreground)_7%,transparent),transparent_44%)]' />
                    <div
                      className={cn(
                        'absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                        theme.glow
                      )}
                    />
                  </div>

                  <CardHeader className='relative z-10 flex min-w-0 flex-row items-center gap-4 rounded-none px-8 pt-6 pb-0 sm:px-9 sm:pt-7'>
                    <span
                      className={cn(
                        'relative flex size-11 shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_0_color-mix(in_oklch,var(--background)_38%,transparent)] ring-1 ring-foreground/10 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 sm:size-12',
                        theme.iconBackground
                      )}
                      aria-hidden='true'
                    >
                      <span className='absolute inset-0 rounded-full bg-foreground/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100' />
                      <Icon
                        className={cn(
                          'relative size-5 transition-colors duration-300',
                          theme.iconText
                        )}
                      />
                    </span>

                    <CardTitle className='min-w-0 flex-1 self-center text-inherit'>
                      <H3
                        className={cn(
                          'flex min-h-11 items-center pb-0 text-base leading-none font-semibold tracking-[-0.015em] sm:min-h-12 sm:text-lg md:text-base lg:text-lg',
                          theme.text
                        )}
                      >
                        <span className='block min-w-0 wrap-break-word'>
                          {destination.name}
                        </span>
                      </H3>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className='relative z-10 grow px-8 pt-5 pb-0 text-inherit sm:px-9'>
                    <P
                      Text={destination.highlight}
                      className={cn(
                        'mb-0 max-w-[34ch] text-sm leading-relaxed tracking-[-0.02em]',
                        theme.mutedText
                      )}
                    />
                  </CardContent>

                  <CardFooter className='relative z-10 mt-auto rounded-none border-t border-foreground/10 px-8 py-5 sm:px-9'>
                    <p className='flex w-full items-center justify-between gap-4 text-[0.68rem] leading-none font-semibold tracking-[0.16em] uppercase'>
                      <span className={cn('opacity-72', theme.mutedText)}>
                        Sesong
                      </span>
                      <span className='text-right text-(--season-fg)'>
                        {destination.season}
                      </span>
                    </p>
                  </CardFooter>
                </Card>
              </AnimatedBlock>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}