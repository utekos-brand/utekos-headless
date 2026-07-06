'use client'

import dynamic from 'next/dynamic'
import { LoadWhenVisible } from '@/components/utils/LoadWhenVisible'

const TechDownFeatureSection = dynamic(
  () =>
    import('./TechDownFeatureSection/TechDownFeatureSection').then(
      module => module.TechDownFeatureSection
    ),
  {
    ssr: false,
    loading: () => (
      <article
        className='min-h-[760px] rounded-[1.75rem] py-16 sm:min-h-[840px] sm:py-24'
        aria-hidden='true'
      />
    )
  }
)

const fallback = (
  <article
    className='rounded-[1.75rem] py-16 sm:py-24'
    aria-hidden='true'
  />
)

export function LazyTechDownFeatureSection() {
  return (
    <LoadWhenVisible fallback={fallback}>
      <TechDownFeatureSection />
    </LoadWhenVisible>
  )
}
