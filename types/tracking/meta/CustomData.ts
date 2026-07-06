// Path: types/tracking/meta/CustomData.ts
import type { ContentItem } from './ContentItem'
export type CustomData = {
  value?: number | undefined
  currency?: string | undefined
  content_name: string
  content_type?: 'product' | 'product_group' | undefined
  content_ids?: string[] | undefined
  contents?: ContentItem[] | undefined
  num_items?: number | undefined
  order_id?: string | undefined
}
