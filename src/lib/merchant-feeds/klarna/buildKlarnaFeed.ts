import { SITE_URL } from '@/constants'
import type {
  CatalogSyncProduct,
  CatalogSyncVariant
} from '@/lib/catalog-sync/types'
import { isValidGtin } from '@/lib/gtin/isValidGtin'
import { normalizeGtin } from '@/lib/gtin/normalizeGtin'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'

import { getKlarnaFeedCategory } from './getKlarnaFeedCategory'

export const KLARNA_FEED_CURRENCY = 'NOK'
export const KLARNA_FEED_SHIPPING = '0 NOK'
export const KLARNA_FEED_DELIVERY_TIME = '2-5 virkedager'
export const KLARNA_FEED_SIZE_SYSTEM = 'NO'

const KLARNA_MAX_PRICE = 10_000_000

type KlarnaFeedOffer = {
  sku: string
  name: string
  price: string
  salePrice: string
  shipping: string
  stockStatus: string
  deliveryTime: string
  manufacturer: string
  ean: string
  condition: string
  mpn: string
  url: string
  imageUrl: string
  category: string
  description: string
  color: string
  size: string
  gender: string
  material: string
  groupId: string
  sizeSystem: string
  adultContent: string
}

function truncateUnicode(value: string, maxLength: number) {
  return Array.from(value).slice(0, maxLength).join('')
}

function sanitizeFeedValue(value: string, maxLength: number) {
  const sanitizedValue = value
    .replace(/\u0000/g, '')
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return truncateUnicode(sanitizedValue, maxLength)
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, '\'')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildProductTitle(
  product: CatalogSyncProduct,
  variant: CatalogSyncVariant
) {
  const optionSummary = variant.selectedOptions
    .map(option => option.value.trim())
    .filter(value => value && value.toLowerCase() !== 'default title')
    .join(', ')
  const title = optionSummary
    ? `${product.title}, ${optionSummary}`
    : product.title

  return sanitizeFeedValue(title, 150)
}

function buildProductDescription(product: CatalogSyncProduct) {
  const description = sanitizeFeedValue(
    stripHtml(product.descriptionHtml),
    10_000
  )

  return description || sanitizeFeedValue(product.title, 10_000)
}

function buildManufacturer(product: CatalogSyncProduct) {
  const vendor = sanitizeFeedValue(product.vendor ?? '', 70)

  if (vendor) {
    return vendor
  }

  const isUtekosProduct = [product.title, product.handle].some(value =>
    /^utekos\b/i.test(value.trim())
  )

  return isUtekosProduct ? 'Utekos' : ''
}

function buildMpn(sku: string | null) {
  const normalizedSku = sku?.trim() ?? ''

  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,69}$/.test(normalizedSku)) {
    return ''
  }

  return normalizedSku
}

function buildGtin(barcode: string | null) {
  const normalizedGtin = normalizeGtin(barcode)

  return normalizedGtin && isValidGtin(normalizedGtin)
    ? normalizedGtin
    : ''
}

function formatMoney(value: string, offerId: string) {
  const normalizedValue = value.trim()

  if (!/^\d+(?:\.\d+)?$/.test(normalizedValue)) {
    throw new Error(
      `Klarna feed offer ${offerId} has invalid price "${value}"`
    )
  }

  const amount = Number(normalizedValue)

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > KLARNA_MAX_PRICE
  ) {
    throw new Error(
      `Klarna feed offer ${offerId} has out-of-range price "${value}"`
    )
  }

  return `${amount.toFixed(2)} ${KLARNA_FEED_CURRENCY}`
}

function buildPrices(variant: CatalogSyncVariant, offerId: string) {
  const currentPrice = Number(variant.price)
  const compareAtPrice = Number(variant.compareAtPrice)
  const hasSalePrice =
    variant.compareAtPrice !== null &&
    Number.isFinite(currentPrice) &&
    Number.isFinite(compareAtPrice) &&
    compareAtPrice > currentPrice

  if (!hasSalePrice) {
    return {
      price: formatMoney(variant.price, offerId),
      salePrice: ''
    }
  }

  return {
    price: formatMoney(variant.compareAtPrice as string, offerId),
    salePrice: formatMoney(variant.price, offerId)
  }
}

function getSelectedOption(
  variant: CatalogSyncVariant,
  optionNames: string[]
) {
  const normalizedNames = new Set(
    optionNames.map(name => name.toLowerCase())
  )
  const option = variant.selectedOptions.find(selectedOption =>
    normalizedNames.has(selectedOption.name.trim().toLowerCase())
  )

  return sanitizeFeedValue(option?.value ?? '', 100)
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function buildSku(
  variant: CatalogSyncVariant,
  offerId: string
) {
  const sku = sanitizeFeedValue(variant.sku?.trim() ?? '', 70)

  if (sku) {
    return sku
  }

  return sanitizeFeedValue(offerId, 70)
}

function buildOffer(
  product: CatalogSyncProduct,
  variant: CatalogSyncVariant
): KlarnaFeedOffer {
  const offerId = cleanShopifyId(variant.id)
  const itemGroupId = cleanShopifyId(product.id)
  const imageUrl =
    variant.image?.url.trim() || product.featuredImage?.url.trim() || ''

  if (!offerId) {
    throw new Error('Klarna feed offer is missing an ID')
  }

  if (!isHttpUrl(imageUrl)) {
    throw new Error(
      `Klarna feed offer ${offerId} is missing a valid image URL`
    )
  }

  const manufacturer = buildManufacturer(product)
  const prices = buildPrices(variant, offerId)

  if (!manufacturer) {
    throw new Error(
      `Klarna feed offer ${offerId} is missing manufacturer/brand`
    )
  }

  return {
    sku: buildSku(variant, offerId),
    name: buildProductTitle(product, variant),
    price: prices.price,
    salePrice: prices.salePrice,
    shipping: KLARNA_FEED_SHIPPING,
    stockStatus: 'InStock',
    deliveryTime: KLARNA_FEED_DELIVERY_TIME,
    manufacturer,
    ean: buildGtin(variant.barcode),
    condition: 'New',
    mpn: buildMpn(variant.sku),
    url: `${SITE_URL}/produkter/${encodeURIComponent(product.handle)}?variant=${encodeURIComponent(variant.id)}`,
    imageUrl,
    category: getKlarnaFeedCategory(product.handle, product.productType),
    description: buildProductDescription(product),
    color: getSelectedOption(variant, ['color', 'farge']),
    size: getSelectedOption(variant, ['size', 'størrelse', 'str']),
    gender: getSelectedOption(variant, ['gender', 'kjønn']) || 'unisex',
    material: getSelectedOption(variant, ['material', 'materiale']),
    groupId: itemGroupId ? sanitizeFeedValue(itemGroupId, 70) : '',
    sizeSystem: KLARNA_FEED_SIZE_SYSTEM,
    adultContent: 'no'
  }
}

function renderOfferXml(offer: KlarnaFeedOffer) {
  const fields: Array<[string, string]> = [
    ['sku', offer.sku],
    ['name', offer.name],
    ['price', offer.price],
    ['sale_price', offer.salePrice],
    ['shipping', offer.shipping],
    ['stock_status', offer.stockStatus],
    ['delivery_time', offer.deliveryTime],
    ['manufacturer', offer.manufacturer],
    ['ean', offer.ean],
    ['condition', offer.condition],
    ['mpn', offer.mpn],
    ['url', offer.url],
    ['image_url', offer.imageUrl],
    ['category', offer.category],
    ['description', offer.description],
    ['color', offer.color],
    ['size', offer.size],
    ['gender', offer.gender],
    ['material', offer.material],
    ['group_id', offer.groupId],
    ['size_system', offer.sizeSystem],
    ['adult_content', offer.adultContent]
  ]

  const body = fields
    .filter(([, value]) => value.length > 0)
    .map(
      ([name, value]) =>
        `    <${name}>${escapeXml(value)}</${name}>`
    )
    .join('\n')

  return `  <product>\n${body}\n  </product>`
}

export function buildKlarnaFeed(products: CatalogSyncProduct[]): string {
  const offers = products
    .filter(product => product.status === 'ACTIVE')
    .flatMap(product =>
      product.variants.edges
        .map(({ node }) => node)
        .filter(
          variant =>
            variant.availableForSale && Boolean(buildGtin(variant.barcode))
        )
        .map(variant => buildOffer(product, variant))
    )

  if (offers.length === 0) {
    throw new Error(
      'Klarna feed contains no purchasable offers with valid GTIN'
    )
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<products>',
    ...offers.map(renderOfferXml),
    '</products>',
    ''
  ].join('\n')
}
