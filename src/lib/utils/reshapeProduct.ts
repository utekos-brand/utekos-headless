import { normalizeProductImage } from '@/lib/helpers/normalizers/normalizeProductImage'
import type { ShopifyProduct } from 'types/product'
import type { RawMetaobject } from 'types/product/MetaobjectReference'
import { reshapeMetaobject } from './reshapeMetaobject'

export const reshapeProduct = (product: ShopifyProduct): ShopifyProduct => {
  if (!product) {
    return product
  }

  const normalizedVariants = product.variants.edges.map(edge => {
    const variant = edge.node
    if (variant.metafield?.reference) {
      const newVariant = { ...variant }
      newVariant.variantProfileData = reshapeMetaobject(
        variant.metafield.reference as unknown as RawMetaobject
      )
      return { ...edge, node: newVariant }
    }
    return edge
  })

  return {
    ...product,
    featuredImage: normalizeProductImage(product.featuredImage, product.title),
    variants: {
      ...product.variants,
      edges: normalizedVariants
    }
  }
}
