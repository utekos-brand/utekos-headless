import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { Flame, Moon, Users } from 'lucide-react'
import type { UseCase } from '../types'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { grillSectionSurfaces } from '../theme/sectionSurfaces'

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
    <article id='bruksomrader' className={card.section}>
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='mb-10 max-w-4xl sm:mb-12 lg:mb-16'>
          <H2
            ID='bruksomrader'
            Text='Utekos gjennom hele kvelden'
            className={card.heading}
          />
          <Lead
            Text='Fra første gjest ankommer til de siste drar — komfort som holder stemningen oppe.'
            className={`mt-4 max-w-2xl pb-0 ${card.lead}`}
          />
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8'>
          {useCases.map((useCase, caseIndex) => (
            <AnimatedBlock
              key={useCase.title}
              className='will-animate-fade-in-up h-full'
              delay={`${caseIndex * 0.1}s`}
              threshold={0.2}
            >
              <Card
                className={`group @container h-full overflow-hidden rounded-lg border border-border shadow-sm ${useCase.color}`}
              >
                <CardContent className='relative p-6 sm:p-8'>
                  <div className='mb-6 flex items-center gap-4'>
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-lg border border-border ${useCase.iconBackground}`}
                    >
                      <useCase.icon
                        className={`size-6 ${useCase.iconColor}`}
                        aria-hidden
                      />
                    </div>
                    <P className='font-utekos-text-medium text-base text-secondary not-first:mt-0'>
                      {useCase.time}
                    </P>
                  </div>

                  <H3
                    Text={useCase.title}
                    className='pb-0 text-xl leading-snug text-foreground'
                  />
                  <P className='mt-4 text-foreground/80 not-first:mt-4'>
                    {useCase.description}
                  </P>
                </CardContent>
              </Card>
            </AnimatedBlock>
          ))}
        </div>
      </div>
    </article>
  )
}
