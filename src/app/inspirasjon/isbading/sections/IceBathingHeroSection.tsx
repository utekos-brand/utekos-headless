// Path: src/app/inspirasjon/isbading/sections/IceBathingHeroSection.tsx

import { Waves } from 'lucide-react'
import Image from 'next/image'
import { InspirationHeroBreadcrumb } from '../../layout/InspirationHeroBreadcrumb'
import { InspirationHero } from '../../layout/hero/InspirationHero'
import { HeroHighlight } from '../../layout/hero/HeroHighlight'
import { IceBathingHeroCta } from './IceBathingHeroCta'
import { iceBathingHeroFeatures } from './iceBathingHeroFeatures'

const IceBathingHeroBackground = (
  <div className='absolute inset-0 select-none' aria-hidden='true'>
    <Image src='/comfyrobe/comfy-isbading-1080.png' alt='' fill className='object-cover md:hidden' priority />
    <Image
      src='/comfyrobe/comfy-isbading-1080-master.png'
      alt=''
      fill
      className='hidden object-cover md:block'
      priority
    />
    <div className='absolute inset-0 bg-background/68 dark:bg-dark-background/68' />
  </div>
)

export function IceBathingHeroSection() {
  return (
    <InspirationHero
      labelledById='isbading-hero-title'
      align='center'
      minHeight='tall'
      containerClassName='py-24'
      background={IceBathingHeroBackground}
      breadcrumb={
        <InspirationHeroBreadcrumb
          label='Isbading'
          color='var(--ancient-water)'
          textColor='var(--background)'
          icon={Waves}
        />
      }
      title={
        <>
          Det kalde gys -{' '}
          <HeroHighlight color='var(--ancient-water)' display='block'>
            den varme belønningen
          </HeroHighlight>
        </>
      }
      titleClassName='max-w-4xl drop-shadow-sm md:text-[clamp(1.875rem,2.35vw,3.5rem)]'
      leadClassName='drop-shadow-sm'
      lead='Mestringsfølelsen etter et isbad er unik. Men turen tilbake til bilen trenger ikke være en kamp. Gjør overgangen fra null grader til full komfort umiddelbar.'
      actions={<IceBathingHeroCta />}
      features={iceBathingHeroFeatures}
      featuresHeading='Høydepunkter for isbading med Utekos'
      featuresHeadingId='isbading-hero-highlights-title'
    />
  )
}
