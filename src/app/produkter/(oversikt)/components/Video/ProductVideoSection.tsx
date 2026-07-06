import { Suspense } from 'react'
import { Layers, Sun } from 'lucide-react'
import { TensorPixVideoCacheWrapper } from './TensorPixVideoCacheWrapper'
import { TypographyVideoSectionH2 } from './TypographyVideoSectionH2'
import { TypographyVideoSectionLead } from './TypographyVideoSectionLead'
import { NavigationButton } from './NavigationButton'
import { PageSection } from '@/components/layout/PageSection'

export function ProductVideoSection() {
  return (
    <article className='relative overflow-hidden py-20 sm:py-32'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[color-mix(in_oklab,var(--interstellar)_85%,#050508)]' />
      <div className='absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent opacity-60' />
      <PageSection as='div'>
        <div className='grid grid-cols-1 items-center gap-x-16 gap-y-16 lg:grid-cols-2'>
          <div className='relative mx-auto w-full max-w-sm'>
            <div className='from-ancient-water/10 to-interstellar/30 absolute -inset-4 -z-10 rounded-[2.5rem] bg-linear-to-tr blur-3xl' />
            <div className='bg-interstellar/50 relative overflow-hidden rounded-4xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl'>
              <div className='pointer-events-none absolute inset-0 z-10 rounded-4xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]' />
              <Suspense
                fallback={
                  <div
                    className='bg-interstellar/30 aspect-9/16 w-full animate-pulse rounded-4xl'
                    aria-hidden
                  />
                }
              >
                <TensorPixVideoCacheWrapper />
              </Suspense>
            </div>
          </div>
          <div className='text-center lg:text-left'>
            <TypographyVideoSectionH2 />
            <TypographyVideoSectionLead />
            <div className='animate-header-item'>
              <div className='mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start'>
                <div className='group  flex items-center gap-4 rounded-lg border-white/10 bg-card p-4 text-nowrap shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90'>
                  <div className='dark:border-dark-foreground flex size-12 shrink-0 items-center justify-center rounded-xl border border-foreground bg-linear-to-br from-white/10 to-transparent text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-transform duration-500 group-hover:scale-110'>
                    <Sun className='h-5 stroke-[1.5]' />
                  </div>
                  <div className='text-left'>
                    <p className='font-sans text-[1rem] leading-[1.1] tracking-[-0.01em] text-foreground'>
                      Garantert varm
                    </p>
                    <p className='mt-1 font-sans text-[0.875rem] tracking-[-0.01em] text-foreground'>
                      Regisser din egen komfort
                    </p>
                  </div>
                </div>

                <div className='group dark:border-dark-card/20  flex items-center gap-4 rounded-lg border-card/20 bg-card p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90'>
                  <div className='dark:border-dark-card/20 dark:from-dark-card/50  flex size-12 shrink-0 items-center justify-center rounded-xl border border-card/20 bg-linear-to-br from-card/50 to-transparent text-card shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:scale-110'>
                    <Layers className='size-5 stroke-[1.5] text-foreground' />
                  </div>
                  <div className='text-left'>
                    <p className='rounded-lg font-sans text-[1rem] leading-[1.1] tracking-[-0.01em] text-foreground'>
                      3-i-1 funksjonalitet
                    </p>
                    <p className='mt-1 font-sans text-[0.875rem] tracking-[-0.01em] text-foreground'>
                      Veksle mellom moduser
                    </p>
                  </div>
                </div>
              </div>
              <NavigationButton />
            </div>
          </div>
        </div>
      </PageSection>
    </article>
  )
}
