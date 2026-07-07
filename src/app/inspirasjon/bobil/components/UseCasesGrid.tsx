import { MoonIcon } from '@heroicons/react/24/outline'
import { Sunrise, Wind } from 'lucide-react'
import { type StaticImageData } from 'next/image'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { InspirationFeatureCard } from '@/app/inspirasjon/components/cards/InspirationFeatureCard'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import type { UseCase } from '../types'
import { cn } from '@/lib/utils/className'

import MorningCoffee from '@public/coffe_utekos.webp'
import UtekosNight from '@public/UtekosNight-1920x1080.png'
import BobilAutumn from '@public/BobilAutomn-1920x1080.png'

const useCaseImages: Record<string, StaticImageData> = {
  Morgen: MorningCoffee,
  Kveld: UtekosNight,
  Overgang: BobilAutumn
}

function getUseCaseImage(useCase: UseCase) {
  return useCaseImages[useCase.time] ?? BobilAutumn
}

export const useCasesData: UseCase[] = [
  {
    icon: Sunrise,
    time: 'Morgen',
    title: 'Den kjølige morgenkaffen',
    description:
      'Start dagen med kaffe utenfor bobilen, innhyllet i varme mens naturen våkner.',
    temperature: '5-12°C',
    color: 'bg-card ',
    iconColor: 'text-foreground ',
    bgColor: 'bg-secondary dark:bg-dark-secondary'
  },
  {
    icon: MoonIcon,
    time: 'Kveld',
    title: 'Sosiale kvelder under stjernene',
    description:
      'Forleng kvelden med venner og familie uten å la kulden drive dere inn.',
    temperature: '8-15°C',
    color: 'bg-card ',
    iconColor: 'text-foreground ',
    bgColor: 'bg-secondary dark:bg-dark-secondary'
  },
  {
    icon: Wind,
    time: 'Overgang',
    title: 'Vår og høst-camping',
    description:
      'Utvid sesongen og opplev Norge når det er på sitt vakreste.',
    temperature: '3-10°C',
    color: 'bg-card ',
    iconColor: 'text-foreground ',
    bgColor: 'bg-secondary dark:bg-dark-secondary'
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
        <div className='mb-8 w-full md:mb-10 lg:mb-12'>
          <H2
            Text='Utekos gjennom bobildøgnet'
            ID='bruksomrader-h2'
            className='text-foreground'
          />
          <Lead
            Text='Fra soloppgang til solnedgang'
            className='text-foreground/90'
          />
        </div>

        <div className='grid auto-rows-fr grid-cols-1 items-stretch gap-8 md:grid-cols-3'>
          {useCases.map((useCase, useCaseIndex) => {
            const Icon = useCase.icon
            const image = getUseCaseImage(useCase)
            const iconBackgroundClass =
              useCase.bgColor ?? 'bg-background'

            return (
              <AnimatedBlock
                key={useCase.title}
                className='will-animate-fade-in-up h-full'
                delay={`${useCaseIndex * 0.1}s`}
                threshold={0.2}
              >
                <InspirationFeatureCard
                  density='media'
                  footerMode='bottom'
                  image={image}
                  imageAlt={`${useCase.title} med Utekos ved bobil`}
                  imageAspect='4/3'
                  icon={Icon}
                  title={useCase.title}
                  description={useCase.description}
                  footerLabel={useCase.time}
                  footerValue={useCase.temperature}
                  className={cn(
                    'border-border/70 bg-background text-foreground',
                    useCase.color
                  )}
                  iconContainerClassName={cn(
                    'border-border/70',
                    iconBackgroundClass
                  )}
                  iconClassName={useCase.iconColor}
                  footerClassName='border-card-foreground/10'
                  footerLabelClassName='text-card-foreground/55'
                  footerValueClassName='text-card-foreground'
                />
              </AnimatedBlock>
            )
          })}
        </div>
      </InspirationContentShell>
    </article>
  )
}