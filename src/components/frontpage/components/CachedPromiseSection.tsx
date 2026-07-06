// Path: src/components/frontpage/CachedPromiseSection.tsx
import { LazyPromiseSection } from '@/components/frontpage/lazy/LazyHeavyClients'
import { cacheLife, cacheTag } from 'next/cache'

export async function CachedPromiseSection() {
  'use cache'
  cacheLife('days')
  cacheTag('static-sections', 'promise-section')

  return <LazyPromiseSection />
}
