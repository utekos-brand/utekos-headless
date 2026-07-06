// Path: types/commerce/order/ShippingLine.ts

import type { MoneySet } from '../MoneySet'
import type { DiscountAllocation } from './Discount'
import type { TaxLine } from './TaxLine'

export type ShippingLine = {
  id: number
  carrier_identifier: string | null
  code: string | null
  current_discounted_price_set: MoneySet
  discounted_price: string
  discounted_price_set: MoneySet
  is_removed: boolean
  phone: string | null
  price: string
  price_set: MoneySet
  requested_fulfillment_service_id: string | null
  source: string
  title: string
  tax_lines: TaxLine[]
  discount_allocations: DiscountAllocation[]
}