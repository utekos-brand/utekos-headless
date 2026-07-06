import type { ShopifyMediaImage } from 'types/media'
import type { ShopifyProduct } from 'types/product'

export function extractComfyrobeImage(product: ShopifyProduct | null): ShopifyMediaImage | null {
  if (!product) return null

  if (product.featuredImage) {
    return { id: product.featuredImage.id, image: product.featuredImage }
  }

  return product.images.edges[0]?.node ?? null
}
