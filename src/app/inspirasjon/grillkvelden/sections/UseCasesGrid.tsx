import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { Flame, Moon, Users } from 'lucide-react'
import type { UseCase } from '../types'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { grillSectionSurfaces } from '../theme/sectionSurfaces'
import { cn } from '@/lib/utils/className'

const { card } = grillSectionSurfaces

export const useCasesData: UseCase[] = [
  {
    icon: Flame,
    time: 'Før maten',
    title: 'Mens grillen blir varm',
    description:
      'Hold gjestene komfortable mens de venter på den perfekte gløden.',
    color: 'bg-background',
    iconColor: 'text-secondary-foreground',
    iconBackground: 'bg-secondary'
  },
  {
    icon: Users,
    time: 'Etter maten',
    title: 'Rundt bordet',
    description:
      'La de gode samtalene fortsette når temperaturen faller.',
    color: 'bg-background',
    iconColor: 'text-secondary-foreground',
    iconBackground: 'bg-secondary'
  },
  {
    icon: Moon,
    time: 'Sent på kvelden',
    title: 'Når stjernene titter frem',
    description:
      'For de som blir igjen — komfort som varer til den siste samtalen.',
    color: 'bg-background',
    iconColor: 'text-secondary-foreground',
    iconBackground: 'bg-secondary'
  }
]

export function UseCasesGrid({
  useCases
}: {
  useCases: UseCase[]
}) {
  return (
    <article
      id='bruksomrader'
      className={cn('overflow-x-clip border-b border-border', card.section)}
    >
      <InspirationContentShell>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 lg:max-w-4xl'>
          <H2
            ID='bruksomrader'
            Text='Utekos gjennom hele kvelden'
            className={card.heading}
          />
          <Lead
            Text='Fra første gjest ankommer til de siste drar — komfort som holder stemningen oppe.'
            className={cn('mt-4 max-w-3xl pb-0 md:mt-6 md:pb-0 lg:pb-0', card.lead)}
          />
        </div>

        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-3 md:gap-8'>
          {useCases.map((useCase, caseIndex) => {
            const Icon = useCase.icon

            return (
              <AnimatedBlock
                key={useCase.title}
                className='will-animate-fade-in-up'
                delay={`${caseIndex * 0.1}s`}
                threshold={0.2}
              >
                <InspirationFeatureCard
                  density='compact'
                  footerMode='flow'
                  icon={Icon}
                  title={useCase.title}
                  description={useCase.description}
                  footerLabel='Tidspunkt'
                  footerValue={useCase.time}
                  backgroundSlot={
                    <>
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--foreground)_5%,transparent),transparent_44%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-foreground/10' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
                    </>
                  }
                  className={cn(
                    'h-auto min-h-0 border-border text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none',
                    useCase.color
                  )}
                  headerClassName='gap-4 px-6 pt-6 sm:px-8 sm:pt-8'
                  iconContainerClassName={cn(
                    'size-12 rounded-lg border-border text-secondary-foreground ring-border/50',
                    useCase.iconBackground
                  )}
                  iconClassName={cn('size-6', useCase.iconColor)}
                  titleClassName='text-left text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground md:text-2xl'
                  contentClassName='px-6 pt-5 pb-5 sm:px-8'
                  descriptionClassName='max-w-[34ch] text-base leading-relaxed text-foreground/80'
                  footerClassName='border-border bg-muted/30 px-6 py-4 sm:px-8'
                  footerLabelClassName='text-muted-foreground'
                  footerValueClassName='text-foreground'
                />
              </AnimatedBlock>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}
