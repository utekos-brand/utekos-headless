import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import type { HostTip } from '../types'
import {
  Music,
  Thermometer,
  Lightbulb,
  UtensilsCrossed
} from 'lucide-react'
import { grillCardThemes } from '../data/grillCardThemes'
import { grillSectionSurfaces } from '../theme/sectionSurfaces'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'

const { background } = grillSectionSurfaces

export const hostTipsData: HostTip[] = [
  {
    name: 'Planlegg for komfort',
    highlight: 'Ha Utekos klar til gjestene',
    icon: Thermometer
  },
  {
    name: 'God belysning',
    highlight: 'Lysslynger skaper magi',
    icon: Lightbulb
  },
  {
    name: 'Enkel servering',
    highlight: 'Fingermat og selvbetjening',
    icon: UtensilsCrossed
  },
  {
    name: 'Riktig musikk',
    highlight: 'En rolig spilleliste setter tonen',
    icon: Music
  }
]

export function HostTipsGrid({ tips }: { tips: HostTip[] }) {
  return (
    <article className={background.section}>
      <InspirationContentShell>
        <div className='mb-10 sm:mb-12 lg:mb-16'>
          <H2
            ID='vertens-sjekkliste'
            Text='Vertens sjekkliste'
            className={background.heading}
          />
          <Lead
            className={`mt-4 max-w-2xl pb-0 ${background.lead}`}
            Text='Fire enkle tips for en uforglemmelig og komfortabel grillkveld.'
          />
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {tips.map((tip, tipIndex) => {
            const theme =
              grillCardThemes[tipIndex % grillCardThemes.length] ??
              grillCardThemes[0]

            return (
              <AnimatedBlock
                className='will-animate-fade-in-up h-full'
                delay={`${tipIndex * 0.08}s`}
                threshold={0.18}
                key={tip.name}
              >
                <Card
                  className={`group @container relative h-full overflow-hidden rounded-lg border shadow-sm ${theme.border} ${theme.surface} transition-[transform,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1`}
                >
                  <CardContent className='relative flex h-full flex-col p-6'>
                    <div className='mb-4 flex items-center gap-4'>
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg border border-border ${theme.iconSurface} transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5`}
                      >
                        <tip.icon
                          className={`size-5 ${theme.iconColor}`}
                          aria-hidden
                        />
                      </div>
                      <h3
                        className={`text-lg leading-snug font-semibold ${theme.text}`}
                      >
                        {tip.name}
                      </h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${theme.mutedText}`}>
                      {tip.highlight}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedBlock>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}
