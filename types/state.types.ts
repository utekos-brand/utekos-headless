import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'

/**
 * @type {Object} VariantEvent
 * @property {string} type - Type of the event
 * @property {string} [optionName] - Name of the option to update
 * @property {string} [value] - Value of the option to update
 * @property {string} |null
 */
export type VariantEvent =
  | { type: 'init'; product: ShopifyProduct }
  | { type: 'updateFromOptions'; optionName: string; value: string }
  | { type: 'syncFromId'; id: string | null }
  | { type: 'reset' }
  | { type: 'error'; message: string }

/**
 * @type {Object} VariantState
 * @property {string} status - Current status of the variant state
 * @property {ShopifyProductVariant} [variant] - Currently selected variant
 * @property {string} [message] - Error message if status is 'error'
 */
export type VariantState =
  | { status: 'idle' }
  | { status: 'selected'; variant: ShopifyProductVariant }
  | { status: 'notfound' }
  | { status: 'error'; message: string }

export type ProductState = {
  [key: string]: string
} & {
  image?: string
}
