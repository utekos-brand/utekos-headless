import ComfyrobeFallbackImage from '@public/comfyrobe/monica-arne-comfy.png'
import { ComfyrobeImageSection } from './ComfyrobeImageSection'
import { ComfyrobeContentColumn } from './ComfyrobeContentColumn'
import { getProduct } from '@/api/lib/products/getProduct'
import { cacheLife, cacheTag } from 'next/cache'
import type { ShopifyMediaImage } from 'types/media'
import { PageSection } from '@/components/layout/PageSection'
import { cn } from '@/lib/utils/className'

interface ProductVariantEdge {
  node: { id: string; availableForSale: boolean }
}

interface Product {
  variants?: { edges: ProductVariantEdge[] }
}

function getFirstAvailableVariantId(
  product: Product | null
): string {
  if (!product || !product.variants || !product.variants.edges)
    return ''

  const availableVariant = product.variants.edges.find(
    (edge: ProductVariantEdge) => edge.node.availableForSale
  )
  if (availableVariant) {
    return availableVariant.node.id
  }
  return product.variants.edges[0]?.node?.id || ''
}

const COMFYROBE_FALLBACK_IMAGE: ShopifyMediaImage = {
  id: 'comfyrobe-fallback',
  image: {
    id: 'comfyrobe-fallback',
    url: ComfyrobeFallbackImage.src,
    altText: 'Comfyrobe™ - Vanntett og vindtett robe',
    width: 1080,
    height: 1080
  }
}

export async function ComfyrobeSection() {
  'use cache'
  cacheLife('days')
  cacheTag('comfyrobe-section')
  const comfyrobeProduct = await getProduct('comfyrobe')
  const comfyrobeId =
    getFirstAvailableVariantId(comfyrobeProduct)
  const comfyrobeImage = COMFYROBE_FALLBACK_IMAGE

  return (
    <PageSection
      as='section'
      background='default'
      className={cn('mx-auto items-center')}
    >
      <div className='dark:border-dark-foreground/12 relative min-w-0 overflow-hidden rounded-2xl border border-foreground/12 bg-card px-6 py-8 text-card-foreground'>
        <div className='absolute inset-0 -z-10 overflow-hidden'>
          <div
            className='absolute top-1/4 left-1/4 size-150 opacity-15 blur-3xl'
            style={{
              background:
                'radial-gradient(circle, #00453E 0%, transparent 70%)'
            }}
          />
          <div
            className='absolute right-1/4 bottom-1/4 size-150 opacity-10 blur-3xl'
            style={{
              background:
                'radial-gradient(circle, #00453E 0%, transparent 70%)'
            }}
          />
        </div>
        <div className='relative grid min-w-0 grid-cols-1 items-center gap-12 rounded-2xl lg:grid-cols-2'>
          <ComfyrobeImageSection image={comfyrobeImage} />

          <ComfyrobeContentColumn variantId={comfyrobeId} />
        </div>
      </div>
    </PageSection>
  )
}
