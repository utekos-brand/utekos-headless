// Path: src/lib/utils/formatPrice.ts
import type { Money } from 'types/commerce/Money'

export const formatPrice = (money: Money): string => {
  const amount = parseFloat(money.amount)
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: 2
  }).format(amount)
}
