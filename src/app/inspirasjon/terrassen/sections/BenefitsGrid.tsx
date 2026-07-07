import { Home, Sparkles, Thermometer, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { terraceBenefitsTheme } from '../theme/terraceInspirationTheme'
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
    <article className={terraceBenefitsTheme.sectionClassName}>
      <InspirationContentShell>
        <MotionReveal className='mb-14 max-w-3xl md:mb-16 md:max-w-4xl'>
          <H2
            ID='terrasse-investering'
            Text='En investering i hjemmet'
            className={terraceBenefitsTheme.titleClassName}
          />
          <Lead className={terraceBenefitsTheme.leadClassName}>
            Få mer ut av uteplassen du allerede har. Utekos er
            designet for å maksimere komforten i hverdagen.
          </Lead>
        </MotionReveal>

        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            const benefitNumber = String(index + 1).padStart(2, '0')

            return (
              <MotionCard
                key={benefit.title}
                delay={index * 0.06}
                y={18}
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
                      <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card-foreground)_7%,transparent),transparent_42%)]' />
                      <div className='absolute inset-x-0 top-0 h-px bg-[color-mix(in_oklch,var(--card-foreground)_18%,transparent)]' />
                      <div className='absolute -top-24 -right-24 size-56 rounded-full bg-[color-mix(in_oklch,var(--ceramic)_18%,transparent)] blur-3xl transition-opacity duration-300 group-hover:opacity-90' />
                    </>
                  }
                  className={terraceBenefitsTheme.cardClassName}
                  headerClassName='gap-5 px-7 pt-7 sm:px-8 sm:pt-8'
                  iconContainerClassName={
                    terraceBenefitsTheme.iconContainerClassName
                  }
                  iconClassName='size-7'
                  titleClassName={terraceBenefitsTheme.titleCardClassName}
                  contentClassName='px-7 pt-5 pb-5 sm:px-8'
                  descriptionClassName={
                    terraceBenefitsTheme.descriptionClassName
                  }
                  footerClassName={terraceBenefitsTheme.footerClassName}
                  footerLabelClassName={
                    terraceBenefitsTheme.footerLabelClassName
                  }
                  footerValueClassName={
                    terraceBenefitsTheme.footerValueClassName
                  }
                />
              </MotionCard>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}
