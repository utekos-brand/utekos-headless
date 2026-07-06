import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Home, Sparkles, Thermometer, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import { P } from '@/components/typography/TypographyP'
import { MotionCard, MotionReveal } from './TerraceMotion'

type Benefit = {
  icon: LucideIcon
  title: string
  description: string
}

export const benefitsData: Benefit[] = [
  {
    icon: Thermometer,
    title: 'Øyeblikkelig komfort',
    description: 'Fra kjølig trekk til lun hygge på et øyeblikk.'
  },
  {
    icon: Home,
    title: 'Utvider hjemmet ditt',
    description:
      'Gjør uteplassen til en funksjonell del av huset, oftere.'
  },
  {
    icon: Sparkles,
    title: 'Enkel i bruk',
    description:
      'Lett å ta frem, lett å rydde vekk. Alltid klar for en kosestund.'
  },
  {
    icon: Users,
    title: 'Inviterer til samvær',
    description:
      'Skap en innbydende atmosfære som gjestene dine vil elske.'
  }
]

export function BenefitsGrid({
  benefits
}: {
  benefits: Benefit[]
}) {
  return (
    <article className='overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <MotionReveal className='mb-10 max-w-3xl sm:mb-12 lg:mb-16 md:max-w-4xl'>
          <H2
            ID='terrasse-investering'
            Text='En investering i hjemmet'
            className='text-foreground'
          />
          <Lead className='mt-4 max-w-3xl pb-0 text-foreground md:mt-6 md:pb-0 lg:pb-0'>
            Få mer ut av uteplassen du allerede har. Utekos er
            designet for å maksimere komforten i hverdagen.
          </Lead>
        </MotionReveal>

        <div className='grid grid-cols-1 gap-6 rounded-3xl bg-card p-6 text-card-foreground md:grid-cols-2 md:gap-8 md:p-8 xl:grid-cols-4'>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon

            return (
              <MotionCard
                key={benefit.title}
                delay={index * 0.06}
                y={18}
              >
                <div className='h-full rounded-lg border border-border bg-background p-6 text-left text-foreground shadow-sm sm:p-7'>
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
              </MotionCard>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}
