import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { Sparkles, Thermometer, Users, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { cn } from '@/lib/utils/className'

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
      'Designet for å stenge den kjølige sjøbrisen ute.'
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
        <div className='mb-10 max-w-3xl sm:mb-12 md:max-w-4xl lg:mb-16'>
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

        <div className='grid grid-cols-1 items-start gap-6 rounded-3xl bg-card p-6 text-card-foreground md:grid-cols-2 md:gap-8 md:p-8 xl:grid-cols-4'>
          {benefitsData.map((benefit, index) => {
            const Icon = benefit.icon
            const benefitNumber = String(index + 1).padStart(2, '0')

            return (
              <div
                key={benefit.title}
                className='boat-benefits-card'
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <InspirationFeatureCard
                  density='compact'
                  footerMode='flow'
                  icon={Icon}
                  title={benefit.title}
                  description={benefit.description}
                  footerLabel='Fordel'
                  footerValue={benefitNumber}
                  backgroundSlot={
                    <>
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--foreground)_5%,transparent),transparent_44%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-foreground/10' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/18 opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
                    </>
                  }
                  className='h-auto min-h-0 border-border bg-background text-foreground shadow-sm ring-border/50 transition-colors duration-300 hover:bg-muted/40 motion-reduce:transition-none'
                  headerClassName='gap-5 px-6 pt-6 sm:px-7 sm:pt-7'
                  iconContainerClassName='size-14 rounded-2xl border-border bg-secondary text-secondary-foreground ring-border/50'
                  iconClassName='size-7'
                  titleClassName='text-left text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl'
                  contentClassName='px-6 pt-5 pb-5 sm:px-7'
                  descriptionClassName='max-w-[32ch] text-base leading-relaxed text-foreground/80'
                  footerClassName='border-border bg-muted/30 px-6 py-4 sm:px-7'
                  footerLabelClassName='text-muted-foreground'
                  footerValueClassName='text-secondary'
                />
              </div>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}