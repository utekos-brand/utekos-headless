// Path: src/app/inspirasjon/isbading/sections/UseCasesGrid.tsx

import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { Car, Coffee, Users } from 'lucide-react'
import type { UseCase } from '../types'

export const useCasesData: UseCase[] = [
  {
    icon: Users,
    time: 'Før/Etter dykket',
    title: 'Skiftesonen',
    description:
      'Trekk armene inn i varmen og skift av deg vått badetøy uten å bli eksponert for vær og vind.',
    temperature: '-15 til 5°C',
    iconColor: 'text-secondary-foreground',
    bgColor: 'bg-secondary'
  },
  {
    icon: Car,
    time: 'Transport',
    title: 'Turen hjem',
    description:
      'Sett deg rett i bilen med Utekos på. Beskytt bilsetet mot fukt og behold varmen hele veien hjem.',
    temperature: 'Kald vind',
    iconColor: 'text-secondary-foreground',
    bgColor: 'bg-secondary'
  },
  {
    icon: Coffee,
    time: 'Debrief',
    title: 'Kaffen etterpå',
    description:
      'Nyt den sosiale stunden med badeklubben etter badet, mens kroppen jobber seg tilbake til varmen.',
    temperature: 'Alle forhold',
    iconColor: 'text-primary-foreground',
    bgColor: 'bg-primary'
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
      className='overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24'
    >
      <InspirationContentShell>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16'>
          <H2
            ID='isbading-bruksomrader'
            Text='Fra forberedelse til varmen'
            className='text-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-foreground/90 md:mt-6 md:pb-0 lg:pb-0'>
            Isbading handler om ritualer. Utekos gjør hvert steg i prosessen
            mer behagelig.
          </Lead>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8'>
          {useCases.map((useCase, useCaseIndex) => {
            const Icon = useCase.icon
            const iconBackgroundClass = useCase.bgColor ?? 'bg-secondary'

            return (
              <AnimatedBlock
                key={useCase.title}
                className='will-animate-fade-in-up'
                delay={`${useCaseIndex * 0.1}s`}
                threshold={0.2}
              >
                <Card className='group @container h-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'>
                  <CardContent className='relative p-6 sm:p-8'>
                    <div className='mb-6 flex items-center gap-4'>
                      <div
                        className={`${iconBackgroundClass} flex size-12 shrink-0 items-center justify-center rounded-lg border border-border`}
                      >
                        <Icon
                          className={`size-6 ${useCase.iconColor}`}
                          aria-hidden='true'
                        />
                      </div>
                      <div>
                        <P className='text-left font-utekos-text-medium leading-snug text-secondary not-first:mt-0'>
                          {useCase.time}
                        </P>
                        <p className='text-sm font-medium text-foreground/80'>
                          {useCase.temperature}
                        </p>
                      </div>
                    </div>
                    <H3
                      Text={useCase.title}
                      className='pb-0 text-left text-xl leading-snug text-card-foreground md:text-2xl'
                    />
                    <P className='mt-4 leading-relaxed text-card-foreground/80 not-first:mt-4'>
                      {useCase.description}
                    </P>
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
