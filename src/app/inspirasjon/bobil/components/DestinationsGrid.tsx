import { AnimatedBlock } from '@/components/AnimatedBlock'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import type { Destination } from '../types'
import { bobilDestinationCardTheme as theme } from '../utils/destinationCardThemes'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'

export function DestinationsGrid({
  destinations
}: {
  destinations: Destination[]
}) {
  return (
    <article className='overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24'>
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

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {destinations.map(
            (destination, destinationIndex) => {
              const Icon = destination.icon

              return (
                <AnimatedBlock
                  key={destination.name}
                  className='will-animate-fade-in-up h-full'
                  delay={`${destinationIndex * 0.08}s`}
                  rootMargin='0px 0px -8% 0px'
                  threshold={0.18}
                >
                  <div
                    className={`group relative flex h-full min-h-72 flex-col overflow-hidden rounded-xl border transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 ${theme.border} ${theme.surface} ${theme.text}`}
                    style={
                      {
                        '--pattern-fg': theme.patternForeground
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className='pointer-events-none absolute inset-0 z-0'
                      aria-hidden='true'
                    >
                      <div className='absolute inset-y-0 left-0 w-5 border-r border-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:w-6' />

                      <div className='absolute inset-y-0 right-0 w-5 border-l border-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:w-6' />

                      <div className='absolute inset-x-0 top-0 h-px bg-(--pattern-fg)' />
                      <div className='absolute inset-x-0 bottom-0 h-px bg-(--pattern-fg)' />
                    </div>

                    <div
                      className='pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                      aria-hidden='true'
                    >
                      <div
                        className={`absolute inset-0 ${theme.glow}`}
                      />
                      <div className='absolute inset-x-0 top-0 h-px bg-foreground/24' />
                    </div>

                    <div className='relative z-10 flex grow flex-col px-8 py-5 sm:px-9 sm:py-6'>
                      <H3
                        className={`mb-5 flex min-w-0 items-center gap-3 pb-0 text-base leading-snug font-semibold tracking-[-0.01em] sm:gap-4 sm:text-lg md:text-base lg:text-lg ${theme.text}`}
                      >
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 sm:size-10 ${theme.iconBackground}`}
                          aria-hidden='true'
                        >
                          <Icon
                            className={`size-4 transition-colors duration-300 sm:size-5 ${theme.iconText}`}
                          />
                        </span>
                        <span className='min-w-0 flex-1 wrap-break-word'>
                          {destination.name}
                        </span>
                      </H3>

                      <P
                        Text={destination.highlight}
                        className={`mb-0 text-sm leading-relaxed tracking-[-0.02em] ${theme.mutedText}`}
                      />

                      <div className='mt-auto pt-5'>
                        <BrandBadge
                          label={destination.season}
                          backgroundColor={
                            theme.badgeBackground
                          }
                          textColor={theme.badgeText}
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedBlock>
              )
            }
          )}
        </div>
      </InspirationContentShell>
    </article>
  )
}
