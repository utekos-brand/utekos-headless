// Path: types/tracking/meta/event/MetaEventData.ts

import type { MetaContentItem } from '../MetaContentItem'

export type MetaEventData = {
  value?: number | undefined
  currency?: string | undefined
  content_name?: string | undefined
  content_type?: string | undefined
  content_category?: string | undefined
  content_ids?: string[] | undefined
  contents?: MetaContentItem[] | undefined
  items?: Array<Record<string, unknown>> | undefined
  item_brand?: string | undefined
  item_list_id?: string | undefined
  item_list_name?: string | undefined
  num_items?: number | undefined
  order_id?: string | undefined
  transaction_id?: string | undefined
  tax?: number | undefined
  shipping?: number | undefined
  coupon?: string | undefined
  search_string?: string | undefined
}
