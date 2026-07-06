export const CATALOG_CUSTOM_LABEL_KEYS = [
  'custom_label_0',
  'custom_label_1',
  'custom_label_2',
  'custom_label_3',
  'custom_label_4'
] as const

export type CatalogCustomLabelKey = (typeof CATALOG_CUSTOM_LABEL_KEYS)[number]

export type CatalogCustomLabels = Partial<Record<CatalogCustomLabelKey, string>>

export type CatalogSyncWeightUnit = 'g' | 'kg' | 'lb' | 'oz'

export type CatalogMetafieldValue = {
  value: string
}

export type CatalogSyncImage = {
  url: string
}

export type CatalogSyncVariant = {
  id: string
  title: string
  sku: string | null
  barcode: string | null
  price: string
  compareAtPrice: string | null
  inventoryQuantity: number | null
  availableForSale: boolean
  image: {
    url: string
  } | null
  selectedOptions: Array<{
    name: string
    value: string
  }>
  weight: number | null
  weightUnit: CatalogSyncWeightUnit
  customLabel0: CatalogMetafieldValue | null
  customLabel1: CatalogMetafieldValue | null
  customLabel2: CatalogMetafieldValue | null
  customLabel3: CatalogMetafieldValue | null
  customLabel4: CatalogMetafieldValue | null
}

export type CatalogSyncProduct = {
  id: string
  title: string
  handle: string
  productType: string | null
  descriptionHtml: string
  vendor: string | null
  status: string
  featuredImage: {
    url: string
  } | null
  images: CatalogSyncImage[]
  variants: {
    edges: Array<{
      node: CatalogSyncVariant
    }>
  }
}
