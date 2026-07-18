import type { MoneySet } from 'types/commerce/MoneySet'

export function readShopifyMoneyAmount(
  moneySet: MoneySet | null | undefined,
  currency: string,
  fieldName: string
) {
  const normalizedCurrency = currency.trim().toUpperCase()

  if (!moneySet) {
    throw new Error(
      `Shopify ${fieldName} is missing a valid ${normalizedCurrency} amount`
    )
  }

  const money = [
    moneySet.presentment_money,
    moneySet.shop_money
  ].find(candidate =>
    candidate?.currency_code?.toUpperCase() === normalizedCurrency
  )

  const amount = Number(money?.amount)

  if (!money || !Number.isFinite(amount) || amount < 0) {
    throw new Error(
      `Shopify ${fieldName} is missing a valid ${normalizedCurrency} amount`
    )
  }

  return amount
}
