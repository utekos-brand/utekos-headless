// SeasonsSection.tsx (Server Component - for hytte-siden)

import { Tabs } from './Tabs'

export function HytteSeasonsSection() {
  return (
    <article className='relative overflow-hidden bg-card pt-24 pb-12 text-card-foreground'>
      <div className='absolute inset-0 -z-10 opacity-25'>
        <div className='absolute top-1/4 left-1/4 size-125 rounded-full bg-secondary/20 blur-3xl' />
        <div className='absolute right-1/4 bottom-1/4 size-125 rounded-full bg-ceramic/15 blur-3xl' />
      </div>

      <div className='container mx-auto px-4'>
        <Tabs />
      </div>
    </article>
  )
}
