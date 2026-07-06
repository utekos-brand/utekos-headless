import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Building2, Coffee, Sofa } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
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
        <MotionReveal className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 md:max-w-4xl'>
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

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {ideas.map((idea, index) => {
            const Icon = idea.icon

            return (
              <MotionCard key={idea.name} delay={index * 0.07}>
                <Card className='group h-full rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'>
                  <CardContent className='p-6'>
                    <div className='mb-3 flex items-center gap-3'>
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground'>
                        <Icon className='size-5' aria-hidden='true' />
                      </div>
                      <H3
                        Text={idea.name}
                        className='min-w-0 pb-0 text-lg leading-snug text-foreground md:text-xl'
                      />
                    </div>
                    <P className='mt-4 text-left leading-relaxed text-foreground/80 not-first:mt-4'>
                      {idea.highlight}
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
