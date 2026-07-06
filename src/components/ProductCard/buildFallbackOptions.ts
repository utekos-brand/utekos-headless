import type { ShopifyProduct } from 'types/product'

export function buildFallbackOptions(
  options: ShopifyProduct['options']
): Record<string, string> {
  if (!options?.length) {
    return {}
  }

  const result: Record<string, string> = {}

  for (const option of options) {
    const firstValue = option.optionValues?.[0]?.name
    if (firstValue) {
      result[option.name] = firstValue
    }
  }

  return result
}
