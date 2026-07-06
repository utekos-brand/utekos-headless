import type { MetaEventType } from 'types/tracking/meta/event'
import type { MetaCatalogCustomLabelKey, MetaCatalogVariant } from '../metaCatalogTypes'

export const CATALOG_ID = '690208780604782'

export const DOUBLE_QUOTE = String.fromCharCode(34)

export const SINGLE_QUOTE = String.fromCharCode(39)

export const EXCLUDED_PRODUCT_IDS = [
  '7710325899512' // Utekos Stapper
]

export const EXCLUDED_VARIANT_IDS = ['42903234642168', '42903234609400']

export const STANDARD_META_EVENTS: ReadonlySet<MetaEventType> = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Purchase',
  'Lead'
])

export const CUSTOM_LABEL_MAPPINGS: Array<{
  labelKey: MetaCatalogCustomLabelKey
  variantField: keyof Pick<
    MetaCatalogVariant,
    'customLabel0' | 'customLabel1' | 'customLabel2' | 'customLabel3' | 'customLabel4'
  >
}> = [
  { labelKey: 'custom_label_0', variantField: 'customLabel0' },
  { labelKey: 'custom_label_1', variantField: 'customLabel1' },
  { labelKey: 'custom_label_2', variantField: 'customLabel2' },
  { labelKey: 'custom_label_3', variantField: 'customLabel3' },
  { labelKey: 'custom_label_4', variantField: 'customLabel4' }
]
