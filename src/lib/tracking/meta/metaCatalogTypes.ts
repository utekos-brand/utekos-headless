import {
  CATALOG_CUSTOM_LABEL_KEYS,
  type CatalogCustomLabelKey,
  type CatalogCustomLabels,
  type CatalogMetafieldValue,
  type CatalogSyncProduct,
  type CatalogSyncVariant,
  type CatalogSyncWeightUnit
} from '@/lib/catalog-sync/types'

export const META_CUSTOM_LABEL_KEYS = CATALOG_CUSTOM_LABEL_KEYS

export type MetaCatalogCustomLabelKey = CatalogCustomLabelKey

export type MetaCatalogCustomLabels = CatalogCustomLabels

export type MetaCatalogAccessTokenSource =
  | 'META_SYSTEM_USER_TOKEN'
  | 'CATALOG_ACCESS_TOKEN'
  | 'META_ACCESS_TOKEN'

export type MetaCatalogShippingWeightUnit = CatalogSyncWeightUnit

export type MetaCatalogMetafieldValue = CatalogMetafieldValue

export type MetaCatalogVariant = CatalogSyncVariant

export type MetaCatalogProduct = CatalogSyncProduct

export type MetaCatalogSyncSummary = {
  productsScanned: number
  productsExcluded: number
  inactiveProductsSkipped: number
  productsMissingGroupId: number
  variantsScanned: number
  variantsExcluded: number
  variantsMissingIdentifiers: number
  variantsQueued: number
  missingLabels: Record<MetaCatalogCustomLabelKey, number>
}

export type MetaCatalogSyncErrorDetails = {
  message: string
  code?: number | string
  type?: string
  fbtraceId?: string
  raw?: unknown
}

export type MetaCatalogSyncResult = {
  success: boolean
  catalogId: string
  tokenSource?: MetaCatalogAccessTokenSource
  summary: MetaCatalogSyncSummary
  batchResponse?: unknown
  error?: MetaCatalogSyncErrorDetails
}
