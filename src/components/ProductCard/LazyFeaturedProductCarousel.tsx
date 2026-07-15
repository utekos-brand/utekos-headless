'use client'

import dynamic from 'next/dynamic'
import { ProductGridSkeleton } from '@/components/frontpage/Skeletons/ProductGridSkeleton'
import { LoadWhenVisible } from '@/components/utils/LoadWhenVisible'

const FeaturedProductCarousel = dynamic(
  () => import('@/components/ProductCard/FeaturedProductCarousel').then(module => module.FeaturedProductCarousel),
  {
    ssr: false,
    loading: () => <ProductGridSkeleton />
  }
)

export function LazyFeaturedProductCarousel() {
  return (
    <LoadWhenVisible fallback={<ProductGridSkeleton />}>
      <FeaturedProductCarousel />
    </LoadWhenVisible>
  )
}
