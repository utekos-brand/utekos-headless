import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
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
import { Lead } from '@/components/typography/Lead'
import { cn } from '@/lib/utils/className'

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
            className={cn(
              'mt-4 max-w-3xl pb-0 md:pb-0 lg:pb-0',
              background.lead
            )}
          />
        </div>

        <div className='grid grid-cols-1 items-start gap-6 rounded-3xl bg-card p-6 text-card-foreground md:grid-cols-2 md:gap-8 md:p-8 lg:grid-cols-4'>
          {benefits.map((benefit, benefitIndex) => {
            const Icon = benefit.icon
            const benefitNumber = String(benefitIndex + 1).padStart(2, '0')

            return (
              <AnimatedBlock
                key={benefit.title}
                className='will-animate-fade-in-scale'
                delay={`${benefitIndex * 0.05}s`}
                threshold={0.2}
              >
                <InspirationFeatureCard
                  density='compact'
                  footerMode='flow'
                  icon={Icon}
                  title={benefit.title}
                  description={benefit.description}
                  footerLabel='Fordel'
                  footerValue={benefitNumber}
                  backgroundSlot={
                    <>
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--foreground)_5%,transparent),transparent_44%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-foreground/10' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
                    </>
                  }
                  className='h-auto min-h-0 border-border bg-background text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'
                  headerClassName='gap-5 px-6 pt-6 sm:px-7 sm:pt-7'
                  iconContainerClassName={cn(
                    'size-14 rounded-2xl border-border text-ceramic ring-border/50',
                    benefit.iconBackground
                  )}
                  iconClassName='size-7'
                  titleClassName='text-left text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl'
                  contentClassName='px-6 pt-5 pb-5 sm:px-7'
                  descriptionClassName='max-w-[32ch] text-base leading-relaxed text-foreground/80'
                  footerClassName='border-border bg-muted/30 px-6 py-4 sm:px-7'
                  footerLabelClassName='text-muted-foreground'
                  footerValueClassName='text-secondary'
                />
              </AnimatedBlock>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}