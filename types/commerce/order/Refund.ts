// Path: types/commerce/order/Refund.ts

import type { MoneySet } from 'types/commerce/MoneySet'

export type Refund = {
  id: number
  order_id: number
  created_at: string
  note: string | null
  user_id: number | null
  processed_at: string
  refund_line_items: Array<{
    id: number
    line_item_id: number
    quantity: number
    restock_type: string
    location_id: number | null
    subtotal: string
    total_tax: string
    subtotal_set: MoneySet
    total_tax_set: MoneySet
  }>
  transactions: Array<{
    id: number
    order_id: number
    amount: string
    kind: string
    gateway: string
    status: string
    created_at: string
  }>
  admin_graphql_api_id: string
}
