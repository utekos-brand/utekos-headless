'use client'

import dynamic from 'next/dynamic'
import { ProductGridSkeleton } from '@/components/frontpage/Skeletons/ProductGridSkeleton'
import { LoadWhenVisible } from '@/components/utils/LoadWhenVisible'
import type { MetaEventType } from 'types/tracking/meta/event'

type LazyFeaturedProductCarouselProps = {
  trackingEventName?: Extract<MetaEventType, 'ViewCategory' | 'ViewItemList'>
  itemListId?: string
  itemListName?: string
  contentCategory?: string
}

const FeaturedProductCarousel = dynamic(
  () => import('@/components/ProductCard/FeaturedProductCarousel').then(module => module.FeaturedProductCarousel),
  {
    ssr: false,
    loading: () => <ProductGridSkeleton />
  }
)

export function LazyFeaturedProductCarousel(props: LazyFeaturedProductCarouselProps) {
  return (
    <LoadWhenVisible fallback={<ProductGridSkeleton />}>
      <FeaturedProductCarousel {...props} />
    </LoadWhenVisible>
  )
}
