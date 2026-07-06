'use client'

import dynamic from 'next/dynamic'
import { LoadWhenVisible } from '@/components/utils/LoadWhenVisible'

const MikrofiberImageSection = dynamic(
  () =>
    import('./MikrofiberImageSection').then(
      module => module.MikrofiberImageSection
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className='aspect-square w-full rounded-xl bg-foreground/12'
        aria-hidden='true'
      />
    )
  }
)

const fallback = (
  <div
    className='aspect-square w-full rounded-xl bg-foreground/12'
    aria-hidden='true'
  />
)

export function LazyMikrofiberImageSection() {
  return (
    <LoadWhenVisible fallback={fallback}>
      <MikrofiberImageSection />
    </LoadWhenVisible>
  )
}
