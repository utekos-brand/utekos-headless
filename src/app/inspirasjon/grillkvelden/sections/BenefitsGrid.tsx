import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import {
  HeartHandshake,
  Thermometer,
  Sparkles,
  Calendar
} from 'lucide-react'
import type { Benefit } from '../types'
import { grillSectionSurfaces } from '../theme/sectionSurfaces'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'

const { background } = grillSectionSurfaces

export const benefitsData: Benefit[] = [
  {
    icon: HeartHandshake,
    title: 'Fornøyde gjester',
    description:
      'Vis at du bryr deg om komforten til gjestene dine.',
    iconBackground: 'bg-muted'
  },
  {
    icon: Thermometer,
    title: 'Mindre stress',
    description:
      'Slipp å tenke på pledd, varmeovner og kalde gjester.',
    iconBackground: 'bg-muted'
  },
  {
    icon: Sparkles,
    title: 'Perfekt stemning',
    description:
      'Skap en avslappet og lun atmosfære som varer lenger.',
    iconBackground: 'bg-muted'
  },
  {
    icon: Calendar,
    title: 'Forlenger sesongen',
    description:
      'Arranger vellykkede grillfester fra tidlig vår til sen høst.',
    iconBackground: 'bg-muted'
  }
]

export function BenefitsGrid({
  benefits
}: {
  benefits: Benefit[]
}) {
  return (
    <article className={background.section}>
      <InspirationContentShell>
        <div className='mb-10 w-full sm:mb-12 lg:mb-16'>
          <H2
            ID='fordeler'
            Text='Fordelene for vertskapet'
            className={background.heading}
          />
          <Lead
            Text='Mindre stress for deg, mer komfort for gjestene — en vinn-vinn for kvelden.'
            className={`mt-4 max-w-3xl pb-0 ${background.lead}`}
          />
        </div>

        <div className='grid grid-cols-1 gap-6 rounded-3xl bg-card p-6 text-card-foreground md:grid-cols-2 md:gap-8 md:p-8 lg:grid-cols-4'>
          {benefits.map((benefit, benefitIndex) => (
            <AnimatedBlock
              key={benefit.title}
              className='will-animate-fade-in-scale text-center'
              delay={`${benefitIndex * 0.05}s`}
              threshold={0.2}
            >
              <div className='h-full rounded-lg border border-border bg-background p-6 text-foreground shadow-sm sm:p-7'>
                <div
                  className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-border ${benefit.iconBackground}`}
                >
                  <benefit.icon
                    className='size-8 text-ceramic'
                    aria-hidden
                  />
                </div>
                <H3
                  Text={benefit.title}
                  className='mb-2 pb-0 text-lg font-bold text-foreground'
                />
                <P
                  Text={benefit.description}
                  className='mx-auto text-center text-base text-foreground/80'
                />
              </div>
            </AnimatedBlock>
          ))}
        </div>
      </InspirationContentShell>
    </article>
  )
}
