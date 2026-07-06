import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { Moon, Sunrise, Wind, type LucideIcon } from 'lucide-react'

interface UseCase {
  icon: LucideIcon
  time: string
  title: string
  description: string
  temperature: string
}

export const useCasesData: UseCase[] = [
  {
    icon: Sunrise,
    time: 'Morgen',
    title: 'Kaffe i havgapet',
    description:
      'Nyt en stille morgen for anker med kaffekoppen, uansett hvor frisk brisen er.',
    temperature: '8-15°C'
  },
  {
    icon: Moon,
    time: 'Kveld',
    title: 'Bryggekos som varer',
    description:
      'Bli samlingspunktet i gjestehavna. Forleng de sosiale kveldene uten å fryse.',
    temperature: '10-18°C'
  },
  {
    icon: Wind,
    time: 'Underveis',
    title: 'Når vinden biter',
    description:
      'Perfekt for å holde varmen i cockpiten når du seiler eller på flybridgen i motvind.',
    temperature: 'Alle temperaturer'
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
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 lg:max-w-4xl'>
          <H2
            ID='batliv-bruksomrader'
            Text='Utekos gjennom båtdøgnet'
            className='text-card-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-card-foreground md:mt-6 md:pb-0 lg:pb-0'>
            Fra soloppgang i uthavn til sene kvelder ved bryggen – Utekos
            holder deg varm.
          </Lead>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8'>
          {useCases.map((useCase, useCaseIndex) => {
            const Icon = useCase.icon

            return (
              <AnimatedBlock
                key={useCase.title}
                className='will-animate-fade-in-up'
                delay={`${useCaseIndex * 0.1}s`}
                threshold={0.2}
              >
                <Card className='group @container h-full overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'>
                  <CardContent className='relative p-6 sm:p-8'>
                    <div className='mb-6 flex items-center gap-4'>
                      <div className='flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground'>
                        <Icon className='size-6' aria-hidden='true' />
                      </div>
                      <div>
                        <P className='text-left font-utekos-text-medium leading-snug text-secondary not-first:mt-0'>
                          {useCase.time}
                        </P>
                        <p className='text-sm font-medium tracking-[-0.02em] text-foreground/80'>
                          {useCase.temperature}
                        </p>
                      </div>
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
              </AnimatedBlock>
            )
          })}
        </div>
      </div>
    </article>
  )
}
