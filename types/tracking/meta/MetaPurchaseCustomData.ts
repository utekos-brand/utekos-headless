// Path: types/tracking/meta/MetaPurchaseCustomData.ts
import type { MetaContentItem } from './MetaContentItem'
export type MetaPurchaseCustomData = {
  currency: string
  value: number
  contents?: MetaContentItem[] | undefined
  content_type?: 'product' | 'product_group' | undefined
  content_ids?: string[] | undefined
  order_id?: string | undefined
  shipping?: number | null | undefined
  tax?: number | null | undefined
  coupon?: string | null | undefined
  num_items?: number | null | undefined
}
