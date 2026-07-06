// Path: src/components/frontpage/FeaturedProductSection.tsx
import {
  HydrationBoundary,
  dehydrate,
  QueryClient
} from '@tanstack/react-query'
import { cacheTag } from 'next/cache'
import { getFeaturedProducts } from '@/api/lib/products/getFeaturedProducts'
import { PageSection } from '@/components/layout/PageSection'
import { ProductCarousel } from '@/components/ProductCard/ProductCarousel'
import { H2 } from '@/components/typography/TypographyH2'

export async function FeaturedProductsSection() {
  'use cache'
  cacheTag('products')

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['products', 'featured'],
    queryFn: getFeaturedProducts
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageSection
        as='article'
        background='default'
      >
        <H2
          ID='featured-products-heading'
          className='mb-8 pb-0 text-left text-4xl leading-[1.2] font-bold tracking-normal text-foreground md:max-w-screen md:text-5xl lg:text-6xl'
        >
          Kundenes favoritter
        </H2>
        <ProductCarousel
          productCardClassName={
            'border border-foreground/12 dark:border-dark-foreground/12 bg-card '
          }
        />
      </PageSection>
    </HydrationBoundary>
  )
}
