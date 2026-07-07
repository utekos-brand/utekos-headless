import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { BookOpen, Coffee, Moon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
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
      className='overflow-x-clip bg-surface-neutral py-16 text-foreground sm:py-20 lg:py-24'
    >
      <InspirationContentShell>
        <MotionReveal className='mb-6 max-w-3xl lg:max-w-4xl'>
          <H2
            ID='terrasse-hjemmekos'
            Text='Hjemmekos, bare ute'
            className='text-foreground'
          />
          <Lead className='max-w-2xl pb-0! text-foreground my-2 md:pb-0! lg:pb-0!'>
            Fra en stille stund for deg selv, til sosiale lag som
            varer lenger.
          </Lead>
        </MotionReveal>

        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-3 md:gap-8'>
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon

            return (
              <MotionCard
                key={useCase.title}
                delay={index * 0.08}
                y={18}
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
                    <>''
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--secondary)_6%,transparent),transparent_44%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-secondary/14' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
                    </>
                  }
                  className='h-auto min-h-0 border-border bg-secondary text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'
                  headerClassName='gap-4 px-6 pt-6 sm:px-8 sm:pt-8'
                  iconContainerClassName='size-12 rounded-lg border-border bg-surface-neutral text-secondary-foreground ring-border/50'
                  iconClassName='size-6'
                  titleClassName='text-left text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground md:text-2xl'
                  contentClassName='px-6 pt-5 pb-5 sm:px-8'
                  descriptionClassName='max-w-[34ch] text-base leading-relaxed text-foreground/80'
                  footerClassName='border-border bg-background px-6 py-4 sm:px-8'
                  footerLabelClassName='text-foreground/90'
                  footerValueClassName='text-secondary'
                />
              </MotionCard>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}