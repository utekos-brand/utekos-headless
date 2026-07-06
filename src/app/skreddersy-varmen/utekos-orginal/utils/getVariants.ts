import type { ShopifyProduct } from 'types/product'

export function getVariants(product: ShopifyProduct | undefined | null) {
  if (!product?.variants) return []
  if (product.variants.edges) return product.variants.edges.map(e => e.node)
  if (Array.isArray(product.variants)) return product.variants
  return []
}
