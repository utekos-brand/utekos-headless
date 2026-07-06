import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'
import type { Image } from 'types/media'

export function computeVariantImages(
  product: ShopifyProduct,
  variant: ShopifyProductVariant | null
): Image[] {
  const images = variant?.variantProfileData?.images

  if (Array.isArray(images)) {
    return images
  }

  return product.featuredImage ? [product.featuredImage] : []
}
