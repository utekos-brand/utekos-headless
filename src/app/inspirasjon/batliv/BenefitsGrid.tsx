import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Sparkles, Thermometer, Users, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'

const benefitsData: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: Thermometer,
    title: 'Øyeblikkelig varme',
    description:
      'Effektiv beskyttelse når temperaturen plutselig synker.'
  },
  {
    icon: Wind,
    title: 'Vindtett komfort',
    description:
      'Designet for å stenge den kjølige sjøbrisen og trekken ute.'
  },
  {
    icon: Sparkles,
    title: 'Kompakt og praktisk',
    description:
      'Tar minimalt med plass og er enkel å stue vekk om bord.'
  },
  {
    icon: Users,
    title: 'Sosial magnet',
    description:
      'Gjør din båt til det naturlige samlingspunktet i havna.'
  }
]

export function BenefitsGrid() {
  return (
    <article className='overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <div className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 md:max-w-4xl'>
          <H2
            ID='batliv-fordeler'
            Text='Skapt for livet på sjøen'
            className='text-foreground'
          />
          <Lead className='mt-4 max-w-3xl pb-0 text-foreground md:mt-6 md:pb-0 lg:pb-0'>
            Vi vet at været kan snu fort. Derfor er Utekos designet for å gi
            deg øyeblikkelig og pålitelig varme.
          </Lead>
        </div>

        <div className='grid grid-cols-1 gap-6 rounded-3xl bg-card p-6 text-card-foreground md:grid-cols-2 md:gap-8 md:p-8 xl:grid-cols-4'>
          {benefitsData.map((benefit, index) => {
            const Icon = benefit.icon

            return (
              <div
                key={benefit.title}
                className='boat-benefits-card h-full rounded-lg border border-border bg-background p-6 text-left text-foreground shadow-sm sm:p-7'
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className='mb-5 flex items-start gap-4 sm:mb-6 sm:gap-5'>
                  <div className='flex size-14 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-ceramic'>
                    <Icon className='size-7' aria-hidden='true' />
                  </div>
                  <H3
                    Text={benefit.title}
                    className='pt-1 pb-0 text-left text-xl leading-snug text-foreground sm:text-2xl'
                  />
                </div>
                <P className='mt-0 text-left text-base leading-relaxed text-foreground/80 not-first:mt-0'>
                  {benefit.description}
                </P>
              </div>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}
