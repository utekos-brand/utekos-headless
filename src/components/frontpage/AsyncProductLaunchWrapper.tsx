import { cacheLife, cacheTag } from 'next/cache'
import { getFeaturedProducts } from '@/api/lib/products/getFeaturedProducts'
import { NewProductLaunchSection } from '@/components/frontpage/components/TechDownCampaign/NewProductLaunchSection'

export async function AsyncProductLaunchWrapper() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const featuredProducts = await getFeaturedProducts()

  const techDownProduct = featuredProducts?.find(
    product => product.handle === 'utekos-techdown'
  )

  const techDownId =
    techDownProduct?.variants?.edges?.find(edge => edge.node.availableForSale)
      ?.node?.id
    || techDownProduct?.variants?.edges?.[0]?.node?.id
    || ''

  if (!techDownId) return null

  return <NewProductLaunchSection />
}
