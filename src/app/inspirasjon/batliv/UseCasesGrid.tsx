import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
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
      className='overflow-x-clip bg-surface-neutral py-16 text-foreground sm:py-20 lg:py-24'
    >
      <InspirationContentShell>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 lg:max-w-4xl'>
          <H2
            ID='batliv-bruksomrader'
            Text='Utekos gjennom båtdøgnet'
            className='text-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-foreground/90 md:mt-6 md:pb-0 lg:pb-0'>
            Fra soloppgang i uthavn til sene kvelder ved bryggen – Utekos
            holder deg varm.
          </Lead>
        </div>

        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-3 md:gap-8'>
          {useCases.map((useCase, useCaseIndex) => {
            const Icon = useCase.icon

            return (
              <AnimatedBlock
                key={useCase.title}
                className='will-animate-fade-in-up'
                delay={`${useCaseIndex * 0.1}s`}
                threshold={0.2}
              >
                <InspirationFeatureCard
                  density='compact'
                  footerMode='flow'
                  icon={Icon}
                  title={useCase.title}
                  description={useCase.description}
                  footerLabel={useCase.time}
                  footerValue={useCase.temperature}
                  backgroundSlot={
                    <>
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card-foreground)_6%,transparent),transparent_44%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-card-foreground/14' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
                    </>
                  }
                  className='h-auto min-h-0 border-border bg-background text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'
                  headerClassName='gap-4 px-6 pt-6 sm:px-8 sm:pt-8'
                  iconContainerClassName='size-12 rounded-lg border-border bg-secondary text-secondary-foreground ring-border/50'
                  iconClassName='size-6'
                  titleClassName='text-left text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground md:text-2xl'
                  contentClassName='px-6 pt-5 pb-5 sm:px-8'
                  descriptionClassName='max-w-[34ch] text-base leading-relaxed text-foreground/80'
                  footerClassName='border-border bg-muted/30 px-6 py-4 sm:px-8'
                  footerLabelClassName='text-foreground/90'
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