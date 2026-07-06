'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { CAROUSEL_SSR } from '@/components/ui/carousel-ssr'
import { ProductListTracking } from '@/components/analytics/ProductListTracking'
import { createColorHexMap } from '@/lib/helpers/shared/createColorHexMap'
import { cn } from '@/lib/utils/className'
import { initializeCarouselProducts } from './initializeCarouselProducts'
import { ProductCard } from './ProductCard'
import type { ShopifyProduct } from 'types/product'
import type { MetaEventType } from 'types/tracking/meta/event'

interface SharedProductCarouselProps {
  products: ShopifyProduct[]
  trackingEventName?: Extract<
    MetaEventType,
    'ViewCategory' | 'ViewItemList'
  >
  itemListId?: string
  itemListName?: string
  contentCategory?: string
  navigationClassName?: string
  cardClassName?: string
}

export function SharedProductCarousel({
  products,
  trackingEventName = 'ViewItemList',
  itemListId = 'product-carousel',
  itemListName = 'Product carousel',
  contentCategory = 'Utekos products',
  navigationClassName,
  cardClassName
}: SharedProductCarouselProps) {
  if (products.length === 0) {
    return null
  }

  const productOptionsMap = initializeCarouselProducts(products)

  return (
    <Carousel
      slideCount={products.length}
      ssr={CAROUSEL_SSR.mobilePeekHalvesAndThirds(
        products.length
      )}
      opts={{ align: 'start', loop: products.length > 3 }}
      className='w-full'
    >
      <ProductListTracking
        products={products}
        eventName={trackingEventName}
        itemListId={itemListId}
        itemListName={itemListName}
        contentCategory={contentCategory}
      />
      <CarouselContent className='-ml-3 md:-ml-8'>
        {products.map((product, index) => {
          const colorHexMap = createColorHexMap(product)
          const initialOptions =
            productOptionsMap.get(product.handle) ??
            ({} as Record<string, string>)

          return (
            <CarouselItem
              key={product.id}
              className='basis-[38%] pl-3 md:basis-1/2 md:pl-8 lg:basis-1/3'
            >
              <ProductCard
                product={product}
                colorHexMap={colorHexMap}
                initialOptions={initialOptions}
                compactMobile
                {...(cardClassName ? { cardClassName } : {})}
                listTrackingContext={{
                  itemListId,
                  itemListName,
                  index
                }}
              />
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious
        forceVisible
        className={cn(
          'top-[34%] left-1.5 z-20 flex border-background dark:border-dark-background bg-foreground dark:bg-dark-foreground text-background dark:text-dark-background shadow-lg ring-1 ring-background/45 dark:ring-dark-background/45 backdrop-blur-sm hover:bg-foreground/90 dark:hover:bg-dark-foreground/90 disabled:opacity-70 md:hidden [&_svg]:size-5'
        )}
      />
      <CarouselNext
        forceVisible
        className={cn(
          'top-[34%] right-1.5 z-20 flex border-background dark:border-dark-background bg-foreground dark:bg-dark-foreground text-background dark:text-dark-background shadow-lg ring-1 ring-background/45 dark:ring-dark-background/45 backdrop-blur-sm hover:bg-foreground/90 dark:hover:bg-dark-foreground/90 disabled:opacity-70 md:hidden [&_svg]:size-5'
        )}
      />
      <CarouselPrevious
        className={cn('max-md:hidden', navigationClassName)}
      />
      <CarouselNext
        className={cn('max-md:hidden', navigationClassName)}
      />
    </Carousel>
  )
}
