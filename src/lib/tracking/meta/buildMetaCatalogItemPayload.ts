import type { MetaCatalogCustomLabels, MetaCatalogProduct, MetaCatalogVariant } from './metaCatalogTypes'

const WEBSITE_BASE_URL = 'https://utekos.no'

type MetaCatalogAvailability = 'in stock' | 'out of stock'
type MetaCatalogCondition = 'new'
type MetaCatalogAgeGroup = 'adult'
type MetaCatalogGender = 'unisex'

export type MetaCatalogItemPayload = MetaCatalogCustomLabels & {
  availability: MetaCatalogAvailability
  age_group: MetaCatalogAgeGroup
  brand: string
  condition: MetaCatalogCondition
  description: string
  gender: MetaCatalogGender
  id: string
  price: string
  title: string
  item_group_id: string
  sale_price?: string
  image_link?: string
  color?: string
  size?: string
  shipping_weight?: string
  link: string
}

function getOptionValue(options: Array<{ name: string; value: string }>, candidateNames: string[]) {
  const matchedOption = options.find(option => candidateNames.includes(option.name.toLowerCase()))

  return matchedOption?.value
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '').trim()
}

function buildProductName(product: MetaCatalogProduct, variant: MetaCatalogVariant) {
  const normalizedVariantTitle = variant.title.trim()

  if (!normalizedVariantTitle || normalizedVariantTitle === 'Default Title') {
    return product.title
  }

  return `${product.title} - ${normalizedVariantTitle}`
}

function buildVariantUrl(productHandle: string, variantId: string) {
  return `${WEBSITE_BASE_URL}/produkter/${productHandle}?variant=${encodeURIComponent(variantId)}`
}

function buildPriceData(variant: Pick<MetaCatalogVariant, 'price' | 'compareAtPrice'>) {
  if (variant.compareAtPrice) {
    return {
      price: `${variant.compareAtPrice} NOK`,
      sale_price: `${variant.price} NOK`
    }
  }

  return {
    price: `${variant.price} NOK`
  }
}

function buildShippingWeight(variant: Pick<MetaCatalogVariant, 'weight' | 'weightUnit'>) {
  if (!variant.weight) {
    return undefined
  }

  return `${variant.weight} ${variant.weightUnit}`
}

export function buildMetaCatalogItemPayload({
  product,
  variant,
  retailerId,
  retailerProductGroupId,
  customLabels
}: {
  product: MetaCatalogProduct
  variant: MetaCatalogVariant
  retailerId: string
  retailerProductGroupId: string
  customLabels: MetaCatalogCustomLabels
}): MetaCatalogItemPayload {
  const availability: MetaCatalogAvailability =
    variant.inventoryQuantity && variant.inventoryQuantity > 0 ? 'in stock' : 'out of stock'

  const description = stripHtml(product.descriptionHtml).slice(0, 5000) || product.title

  const payload: MetaCatalogItemPayload = {
    availability,
    age_group: 'adult',
    brand: product.vendor || 'Utekos',
    condition: 'new',
    description,
    gender: 'unisex',
    id: retailerId,
    item_group_id: retailerProductGroupId,
    link: buildVariantUrl(product.handle, variant.id),
    ...buildPriceData(variant),
    title: buildProductName(product, variant),
    ...customLabels
  }

  const color = getOptionValue(variant.selectedOptions, ['farge', 'color'])
  if (color) {
    payload.color = color
  }

  const size = getOptionValue(variant.selectedOptions, ['size', 'størrelse', 'str'])
  if (size) {
    payload.size = size
  }

  const imageUrl = variant.image?.url || product.featuredImage?.url
  if (imageUrl) {
    payload.image_link = imageUrl
  }

  const shippingWeight = buildShippingWeight(variant)
  if (shippingWeight) {
    payload.shipping_weight = shippingWeight
  }

  return payload
}
