'use client'

import { reportCanonicalSelectItem } from './selectItemReporter'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

export type ReportProductListSelectItemInput = {
  destinationUrl: string
  itemListId: string
  product: ShopifyProduct
  variant: ShopifyProductVariant | null | undefined
}

export function reportProductListSelectItem(
  input: ReportProductListSelectItemInput
): void {
  if (!input.variant) return

  try {
    reportCanonicalSelectItem({
      product: input.product,
      variant: input.variant,
      itemListId: input.itemListId,
      destinationUrl: input.destinationUrl
    })
  } catch {
    // Fail-open for navigation; reporter already rethrows async
  }
}
