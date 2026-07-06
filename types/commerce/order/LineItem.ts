// Path: types/commerce/order/LineItem.ts
import type { DiscountAllocation } from './Discount'
import type { MoneySet } from 'types/commerce/MoneySet'
import type { TaxLine } from './TaxLine'
export type LineItem = {
  id: number
  admin_graphql_api_id: string
  attributed_staffs: Array<{
    id: string
    quantity: number
  }>
  current_quantity: number
  fulfillable_quantity: number
  fulfillment_service: string
  fulfillment_status: string | null
  gift_card: boolean
  grams: number
  name: string
  price: string
  price_set: MoneySet
  product_exists: boolean
  product_id: number
  properties: Array<{ name: string; value: string }>
  quantity: number
  requires_shipping: boolean
  sales_line_item_group_id: number | null
  sku: string | null
  taxable: boolean
  title: string
  total_discount: string
  total_discount_set: MoneySet
  variant_id: number | null
  variant_inventory_management: string | null
  variant_title: string | null
  vendor: string | null
  tax_lines: TaxLine[]
  discount_allocations: DiscountAllocation[]
}

export type LineItemGroup = {
  id: number
  title: string
  line_items: LineItem[]
}
