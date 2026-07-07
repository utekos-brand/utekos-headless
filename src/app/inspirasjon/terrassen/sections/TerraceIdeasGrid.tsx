import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { BookOpen, Building2, Coffee, Sofa } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { MotionCard, MotionReveal } from './TerraceMotion'

type TerraceIdea = {
  name: string
  highlight: string
  icon: LucideIcon
}

export const terraceIdeasData: TerraceIdea[] = [
  {
    name: 'Morgenkaffen ute',
    highlight: 'En lun start på dagen',
    icon: Coffee
  },
  {
    name: 'Lounge-området',
    highlight: 'For sosiale kvelder',
    icon: Sofa
  },
  {
    name: 'Balkong-oasen',
    highlight: 'Maksimal komfort, minimal plass',
    icon: Building2
  },
  {
    name: 'Lesekroken',
    highlight: 'Fordyp deg i en annen verden',
    icon: BookOpen
  }
]

export function TerraceIdeasGrid({
  ideas
}: {
  ideas: TerraceIdea[]
}) {
  return (
    <article className='overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <MotionReveal className='mb-10 max-w-3xl sm:mb-12 md:max-w-4xl lg:mb-16'>
          <H2
            ID='terrasse-ideer'
            Text='Ideer for din uteplass'
            className='text-card-foreground'
          />
          <Lead className='mt-4 max-w-2xl pb-0 text-card-foreground md:mt-6 md:pb-0 lg:pb-0'>
            Uansett størrelse på uteplassen din, kan den bli en
            oase for komfort og hygge.
          </Lead>
        </MotionReveal>

        <div className='grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {ideas.map((idea, index) => {
            const Icon = idea.icon
            const ideaNumber = String(index + 1).padStart(2, '0')

            return (
              <MotionCard
                key={idea.name}
                delay={index * 0.07}
                y={18}
              >
                <InspirationFeatureCard
                  density='compact'
                  footerMode='flow'
                  icon={Icon}
                  title={idea.name}
                  description={idea.highlight}
                  footerLabel='Idé'
                  footerValue={ideaNumber}
                  backgroundSlot={
                    <>
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card-foreground)_6%,transparent),transparent_44%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-card-foreground/14' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
                    </>
                  }
                  className='h-auto min-h-0 border-border bg-background text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'
                  headerClassName='gap-4 px-6 pt-6 sm:px-7 sm:pt-7'
                  iconContainerClassName='size-10 rounded-lg border-border bg-secondary text-secondary-foreground ring-border/50'
                  iconClassName='size-5'
                  titleClassName='min-h-10 text-left text-lg leading-snug font-semibold tracking-[-0.02em] text-foreground md:text-xl'
                  contentClassName='px-6 pt-4 pb-5 sm:px-7'
                  descriptionClassName='max-w-[30ch] text-base leading-relaxed text-foreground/80'
                  footerClassName='border-border bg-muted/30 px-6 py-4 sm:px-7'
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