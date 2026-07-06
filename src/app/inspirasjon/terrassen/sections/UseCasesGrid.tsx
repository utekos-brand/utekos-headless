import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Coffee, Moon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { MotionCard, MotionReveal } from './TerraceMotion'

type UseCase = {
  icon: LucideIcon
  time: string
  title: string
  description: string
}

export const useCasesData: UseCase[] = [
  {
    icon: Coffee,
    time: 'Morgen',
    title: 'Den første vårkaffen',
    description:
      'Start dagen i frisk luft uten å fryse. Nyt roen før resten av verden våkner.'
  },
  {
    icon: Moon,
    time: 'Kveld',
    title: 'Sene sommerkvelder',
    description:
      'Ikke la duggfallet jage deg inn. Forleng de gode samtalene under stjernene.'
  },
  {
    icon: BookOpen,
    time: 'Ettermiddag',
    title: 'En rolig lesestund',
    description:
      'Finn roen med en god bok og en kopp te på en kjølig høstdag, pakket inn i varme.'
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
      className='overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24'
    >
      <InspirationContentShell>
        <MotionReveal className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 lg:max-w-4xl'>
          <H2
            ID='terrasse-hjemmekos'
            Text='Hjemmekos, bare ute'
            className='text-card-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-card-foreground md:mt-6 md:pb-0 lg:pb-0'>
            Fra en stille stund for deg selv, til sosiale lag som
            varer lenger.
          </Lead>
        </MotionReveal>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8'>
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon

            return (
              <MotionCard key={useCase.title} delay={index * 0.08}>
                <Card className='group @container h-full overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'>
                  <CardContent className='relative p-6 sm:p-8'>
                    <div className='mb-6 flex items-center gap-4'>
                      <div className='flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground'>
                        <Icon className='size-6' aria-hidden='true' />
                      </div>
                      <P className='text-left font-utekos-text-medium leading-snug text-secondary not-first:mt-0'>
                        {useCase.time}
                      </P>
                    </div>
                    <H3
                      Text={useCase.title}
                      className='pb-0 text-left text-xl leading-snug text-foreground md:text-2xl'
                    />
                    <P className='mt-4 leading-relaxed text-foreground/80 not-first:mt-4'>
                      {useCase.description}
                    </P>
                  </CardContent>
                </Card>
              </MotionCard>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}
