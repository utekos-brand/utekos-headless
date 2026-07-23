import { cacheLife, cacheTag } from 'next/cache'
import { getFeaturedProducts } from '@/api/lib/products/getFeaturedProducts'
import { NewProductLaunchSection } from '@/components/frontpage/components/TechDownCampaign/NewProductLaunchSection'
import { getProductWithoutSmallSize } from '@/components/products/getProductWithoutSmallSize'

export async function AsyncProductLaunchWrapper() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const featuredProducts = await getFeaturedProducts()

  const techDownProduct = featuredProducts?.find(
    product => product.handle === 'utekos-techdown'
  )

  if (!techDownProduct) {
    return null
  }

  const product = getProductWithoutSmallSize(techDownProduct)
  const selectedVariant =
    product.selectedOrFirstAvailableVariant
    ?? product.variants.edges.find(edge => edge.node.availableForSale)
      ?.node
    ?? product.variants.edges[0]?.node
    ?? null

  if (!selectedVariant) {
    return null
  }

  return (
    <NewProductLaunchSection
      product={product}
      selectedVariant={selectedVariant}
    />
  )
}
