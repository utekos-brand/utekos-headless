// Path: src/app/produkter/(oversikt)/components/MicrofiberSection/MikrofiberSection.tsx

import { LazyMikrofiberImageSection } from './LazyMikrofiberImageSection'
import { MikrofiberContentColumn } from './MikrofiberContentColumn'

export async function MikrofiberSection() {
  return (
    <article className='mx-auto w-full py-20 sm:py-24'>
      <div className='container mx-auto px-4'>
        <div className='relative overflow-hidden rounded-[1.75rem] border border-border bg-muted p-5 text-foreground shadow-[0_28px_90px_-62px_color-mix(in_oklch,var(--foreground)_18%,transparent)] sm:p-8 lg:p-12'>
          <div className='pointer-events-none absolute inset-0 opacity-70'>
            <div
              className='absolute top-0 -left-20 size-136 rounded-full blur-3xl'
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--secondary) 38%, transparent) 0%, transparent 70%)'
              }}
            />
            <div
              className='absolute -right-20 bottom-0 size-136 rounded-full blur-3xl'
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--primary) 24%, transparent) 0%, transparent 72%)'
              }}
            />
            <div
              className='absolute top-1/2 left-1/2 size-120 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl'
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--card) 32%, transparent) 0%, transparent 74%)'
              }}
            />
          </div>

          <div className='relative z-10 grid grid-cols-1 gap-8 rounded-2xl lg:grid-cols-2 lg:items-stretch lg:gap-12'>
            <LazyMikrofiberImageSection />
            <MikrofiberContentColumn />
          </div>
        </div>
      </div>
    </article>
  )
}
