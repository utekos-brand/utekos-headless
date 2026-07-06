import type { ShopifyProduct } from 'types/product/ShopifyProduct'

export function createSwatchColorMap(
  product: ShopifyProduct | undefined
): Map<string, string> {
  const map = new Map<string, string>()

  if (!product?.variants?.edges) return map

  for (const edge of product.variants.edges) {
    const variant = edge.node
    const colorOption = variant.selectedOptions.find(
      option => option.name.toLowerCase() === 'farge'
    )

    const metaColorData = variant.variantProfileData?.swatchHexcolorForVariant

    if (
      colorOption?.value
      && metaColorData
      && typeof metaColorData === 'object'
      && !Array.isArray(metaColorData)
      && metaColorData.value
    ) {
      map.set(colorOption.value, metaColorData.value as string)
    }
  }

  return map
}
