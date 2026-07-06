// Path: types/commerce/order/Fulfillment.ts

import type { LineItem } from 'types/commerce/order/LineItem'
export type Fulfillment = {
  id: number
  order_id: number
  status: string
  created_at: string
  service: string
  updated_at: string
  tracking_company: string | null
  shipment_status: string | null
  location_id: number | null
  line_items: LineItem[]
  tracking_number: string | null
  tracking_numbers: string[]
  tracking_url: string | null
  tracking_urls: string[]
  receipt: Record<string, unknown>
  name: string
  admin_graphql_api_id: string
}
