// Path: types/commerce/MoneySet.ts
import type { CurrencyCode } from './CurrencyCode'

export type MoneySet = {
  shop_money: { amount: string | number; currency_code: CurrencyCode }
}
