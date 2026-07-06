'use client'

/**
 * Lazy wrappers for heavy below-the-fold homepage sections.
 *
 * All four sections are already `'use client'` and import animation
 * libraries (Motion, Embla, animation hooks) that are not needed on
 * first paint. Wrapping them in `next/dynamic({ ssr: false })` moves
 * the code into per-section chunks loaded after hydration, which
 * trims the initial JS payload (`0956.*.js`, `052_*.js`, `main.*.js`)
 * and lowers TBT.
 *
 * Each wrapper renders a fixed-height placeholder during load to keep
 * Cumulative Layout Shift at 0 when the user scrolls before the chunk
 * arrives.
 *
 * `ssr: false` is only allowed inside a client component, so this file
 * holds all four dynamic imports.
 */

import dynamic from 'next/dynamic'

const sectionPlaceholder = (className: string) => <div className={className} aria-hidden='true' />

export const LazyNewProductInStoreNotice = dynamic(
  () =>
    import('@/components/frontpage/IntersportSection/NewProductInStoreNotice').then(
      m => m.NewProductInStoreNotice
    ),
  {
    ssr: false,
    loading: () => sectionPlaceholder('min-h-[200px]')
  }
)

export const LazyPromiseSection = dynamic(
  () => import('@/components/frontpage/PromiseSection').then(m => m.PromiseSection),
  {
    ssr: false,
    loading: () => sectionPlaceholder('min-h-[600px] md:min-h-[700px]')
  }
)

export const LazyChatAndInfoSection = dynamic(
  () =>
    import('@/components/frontpage/ChatAndInfoSection/ChatAndInfoSection').then(m => m.ChatAndInfoSection),
  {
    ssr: false,
    loading: () => sectionPlaceholder('min-h-[500px]')
  }
)

export const LazyTestimonialConstellation = dynamic(
  () =>
    import('@/components/frontpage/Testimonial/TestimonialConstellation').then(
      m => m.TestimonialConstellation
    ),
  {
    ssr: false,
    loading: () => sectionPlaceholder('min-h-[800px]')
  }
)
