/**
 * @klarna-agent
 * @id get-klarna-minor-unit-amount
 * @title Convert price to Klarna minor currency units
 * @domain Klarna
 * @kind utility
 * @export getKlarnaMinorUnitAmount
 * @docs-index /src/components/klarna/agents.txt
 * @dependencies types/index.ts
 */
type GetKlarnaMinorUnitAmountInput = {
  amount: string
  currencyCode: string
}

const CENT_BASED_CURRENCIES = new Set(['DKK', 'EUR', 'NOK', 'SEK', 'USD'])

export function getKlarnaMinorUnitAmount({
  amount,
  currencyCode
}: GetKlarnaMinorUnitAmountInput): string | undefined {
  const normalizedCurrencyCode = currencyCode.toUpperCase()

  if (!CENT_BASED_CURRENCIES.has(normalizedCurrencyCode)) {
    return undefined
  }

  const parsedAmount = Number(amount)

  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    return undefined
  }

  return String(Math.round(parsedAmount * 100))
}
