import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'

import { SizeGuideSectionShell } from './SizeGuideSectionShell'

export function SizeGuideHero() {
  return (
    <SizeGuideSectionShell
      id='size-guide-hero'
      surface='teal'
      showPattern={false}
      className='border-b border-sidebar-foreground/70 dark:border-dark-sidebar-foreground/70'
    >
      <hgroup className='max-w-3xl'>
        <BrandBadge
          label=' Handlehjelp'
          bgColor='var(--sidebar-foreground)'
          fgColor='var(--sidebar)'
          className='mb-4 border border-sidebar-foreground/12 dark:border-dark-sidebar-foreground/12 px-5 py-2.5 font-sans text-base tracking-wide sm:px-8 sm:py-3'
        />
        <h1 className='py-4 text-3xl leading-[1.05] font-bold text-sidebar-foreground dark:text-dark-sidebar-foreground md:text-5xl lg:text-6xl'>
          Størrelsesguide
        </h1>
        <p className='mt-5 max-w-2xl text-lg leading-relaxed text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90'>
          Riktig størrelse gir mer ro, bedre varme og en passform
          som følger deg ute. Bruk guiden til å velge trygt før
          du handler.
        </p>
      </hgroup>
    </SizeGuideSectionShell>
  )
}
