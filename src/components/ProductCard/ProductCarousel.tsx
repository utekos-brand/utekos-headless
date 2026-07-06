import { getFeaturedProducts } from '@/api/lib/products/getFeaturedProducts'
import { handles as featuredProductHandles } from '@/db/data/products/product-info'
import { SharedProductCarousel } from './SharedProductCarousel'
import { getProductWithoutSmallSize } from '@/components/products/getProductWithoutSmallSize'
import type { ShopifyProduct } from 'types/product'
import type { MetaEventType } from 'types/tracking/meta/event'

type ProductCarouselProps = {
  trackingEventName?: Extract<
    MetaEventType,
    'ViewCategory' | 'ViewItemList'
  >
  itemListId?: string
  itemListName?: string
  contentCategory?: string
  productCardClassName?: string
}

export async function ProductCarousel({
  trackingEventName,
  itemListId,
  itemListName,
  contentCategory,
  productCardClassName
}: ProductCarouselProps) {
  const products = await getFeaturedProducts()

  if (!products || products.length === 0) {
    return null
  }

  const productsByHandle = new Map(
    products.map(product => [product.handle, product])
  )
  const featuredProducts = featuredProductHandles
    .map(handle => productsByHandle.get(handle))
    .filter((product): product is ShopifyProduct =>
      Boolean(product)
    )
    .map(getProductWithoutSmallSize)

  if (featuredProducts.length === 0) {
    return null
  }

  const trackingProps = {
    ...(trackingEventName ? { trackingEventName } : {}),
    ...(itemListId ? { itemListId } : {}),
    ...(itemListName ? { itemListName } : {}),
    ...(contentCategory ? { contentCategory } : {})
  }
  const cardStyleProps =
    productCardClassName ?
      { cardClassName: productCardClassName }
    : {}

  return (
    <SharedProductCarousel
      products={featuredProducts}
      navigationClassName='bg-card '
      {...trackingProps}
      {...cardStyleProps}
    />
  )
}
