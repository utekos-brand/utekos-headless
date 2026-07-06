// Path: src/app/handlehjelp/teknologi-materialer/layout/TechHero.tsx

import { ArrowDown } from 'lucide-react'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'

export function TechHero() {
  return (
    <article className='relative mb-24 flex min-h-[90vh] flex-col items-center justify-center overflow-hidden border-b border-sidebar-foreground/70 dark:border-dark-sidebar-foreground/70 bg-sidebar dark:bg-dark-sidebar text-center text-sidebar-foreground dark:text-dark-sidebar-foreground'>
      {/* Bakgrunnseffekter */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ancient-water/20 blur-[120px]' />
        <div className='absolute right-0 bottom-0 h-[400px] w-[400px] translate-y-1/3 rounded-full bg-havdyp/20 blur-[100px]' />
      </div>

      <div className='relative z-10 container mx-auto px-4'>
        <div className='mx-auto flex max-w-4xl flex-col items-center space-y-8'>
          <BrandBadge
            backgroundColor='var(--card)'
            textColor='var(--primary)'
            className='border border-blue-200/30 px-8! py-3! text-base!'
          >
            Skapt for komfort
          </BrandBadge>

          <h1 className='text-5xl font-bold text-sidebar-foreground dark:text-dark-sidebar-foreground sm:text-7xl md:text-8xl'>
            Ett plagg. <br />
            <span className='text-sidebar-foreground dark:text-dark-sidebar-foreground'>
              Tre opplevelser.
            </span>
          </h1>

          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90 md:text-xl'>
            Det unike med Utekos er friheten til å velge. Fra en
            isolerende kokong til en elegant parkas på sekunder.
            Vi kaller det{' '}
            <strong className='text-sidebar-foreground dark:text-dark-sidebar-foreground'>
              adaptiv funksjonalitet
            </strong>
            .
          </p>
        </div>
      </div>
      <div className='absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90'>
        <ArrowDown className='h-6 w-6' />
      </div>
    </article>
  )
}
