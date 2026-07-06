// Path: types/commerce/order/Discount.ts

import type { MoneySet } from 'types/commerce/MoneySet'

export type DiscountAllocation = {
  amount: string
  amount_set: MoneySet
  discount_application_index: number
}

export type DiscountApplication = {
  type: string
  value: string
  value_type: string
  allocation_method: string
  target_selection: string
  target_type: string
  description: string | undefined
  title: string | undefined
  code: string | undefined
}
