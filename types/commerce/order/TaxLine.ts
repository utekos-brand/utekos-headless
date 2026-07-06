// Path: types/commerce/order/TaxLine.ts

import type { MoneySet } from 'types/commerce/MoneySet'

export type TaxLine = {
  title: string
  price: string
  price_set: MoneySet
  rate: number
}
