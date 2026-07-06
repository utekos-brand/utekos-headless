import {
  CalendarIcon,
  SparklesIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { ThermometerIcon } from 'lucide-react'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { Lead } from '@/components/typography/Lead'
import type { Benefit } from '../types'

export const benefitsData: Benefit[] = [
  {
    icon: ThermometerIcon,
    title: 'Øyeblikkelig varme',
    description: 'Fra kald morgen til koselig stund på sekunder',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  },
  {
    icon: SparklesIcon,
    title: 'Kompakt og praktisk',
    description:
      'Tar minimal plass i bobilen, maksimal komfort på turen',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  },
  {
    icon: CalendarIcon,
    title: 'Forleng sesongen',
    description:
      'Bruk bobilen fra tidlig vår til sen høst i komfort',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  },
  {
    icon: UsersIcon,
    title: 'Sosial magnet',
    description: 'Bli samlingspunktet på campingplassen',
    color: 'text-ceramic',
    bgColor: 'bg-muted'
  }
]

export function BenefitsGrid({
  benefits
}: {
  benefits: Benefit[]
}) {
  return (
    <article className='overflow-x-clip border-b border-border bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <div className='mb-6 md:mb-8 lg:mb-10'>
          <H2
            Text='Skapt for bobilisten'
            ID='skapt-for-bobilisten'
            className='text-foreground'
          />
          <Lead
            Text='Komfort som følger bobilen. Fra tidlig vår til sen høst.'
            className='text-foreground'
          />
        </div>

        <div className='grid grid-cols-1 gap-8 rounded-3xl bg-card py-6 md:grid-cols-2 md:py-12 lg:grid-cols-4'>
          {benefits.map((benefit, benefitIndex) => {
            const Icon = benefit.icon
            const iconBackgroundClass =
              benefit.bgColor ?? 'bg-muted'

            return (
              <AnimatedBlock
                key={benefit.title}
                className='will-animate-fade-in-scale text-center'
                delay={`${benefitIndex * 0.05}s`}
                threshold={0.2}
              >
                <div
                  className={`${iconBackgroundClass} mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-border`}
                >
                  <Icon
                    className={`size-8 ${benefit.color}`}
                    aria-hidden='true'
                  />
                </div>

                <H3
                  Text={benefit.title}
                  className='mb-2 pb-0 text-foreground'
                />

                <p className='tracking-[-0.02em] text-foreground/90'>
                  {benefit.description}
                </p>
              </AnimatedBlock>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}
