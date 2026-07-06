import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import Image from 'next/image'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H1 } from '@/components/typography/TypographyH1'
import { Lead } from '@/components/typography/Lead'
import { InspirationHeroBreadcrumb } from '../../layout/InspirationHeroBreadcrumb'
import { InspirationHeroFeatureGrid } from '../../layout/hero/InspirationHeroFeatureGrid'
import { IceBathingHeroCta } from './IceBathingHeroCta'
import { iceBathingHeroFeatures } from './iceBathingHeroFeatures'

export function IceBathingHeroSection() {
  return (
    <section
      aria-labelledby='isbading-hero-title'
      className='relative isolate flex min-h-[110svh] flex-col justify-center overflow-x-clip bg-background text-foreground'
    >
      <div className='absolute inset-0 select-none' aria-hidden='true'>
        <Image
          src='/comfyrobe/comfy-isbading-1080.png'
          alt=''
          fill
          className='object-cover md:hidden'
          priority
        />
        <Image
          src='/comfyrobe/comfy-isbading-1080-master.png'
          alt=''
          fill
          className='hidden object-cover md:block'
          priority
        />
        <div className='absolute inset-0 bg-background/68' />
      </div>

      <InspirationContentShell className='relative z-10 py-24 text-center'>
        <div className='mx-auto max-w-5xl'>
          <header className='flex flex-col gap-10 md:gap-12'>
            <AnimatedBlock
              className='will-animate-fade-in-up flex justify-center'
              delay='0.1s'
            >
              <InspirationHeroBreadcrumb label='Isbading' />
            </AnimatedBlock>

            <AnimatedBlock className='will-animate-fade-in-up' delay='0.2s'>
              <H1
                ID='isbading-hero-title'
                className='mx-auto max-w-4xl text-balance text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl'
              >
                Det kalde gys –{' '}
                <span className='text-secondary'>den varme belønningen</span>
              </H1>
              <Lead className='mx-auto mt-6 max-w-3xl pb-0 text-foreground md:pb-0 lg:pb-0'>
                Mestringsfølelsen etter et isbad er unik. Men turen tilbake til
                bilen trenger ikke være en kamp. Gjør overgangen fra null grader
                til full komfort umiddelbar.
              </Lead>
            </AnimatedBlock>

            <AnimatedBlock
              className='will-animate-fade-in-up flex justify-center'
              delay='0.4s'
            >
              <IceBathingHeroCta />
            </AnimatedBlock>
          </header>

          <AnimatedBlock
            className='will-animate-fade-in-up mt-16 sm:mt-20'
            delay='0.5s'
          >
            <InspirationHeroFeatureGrid
              features={iceBathingHeroFeatures}
              heading='Høydepunkter for isbading med Utekos'
              headingId='isbading-hero-highlights-title'
              align='center'
            />
          </AnimatedBlock>
        </div>
      </InspirationContentShell>
    </section>
  )
}
