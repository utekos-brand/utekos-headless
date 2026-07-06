import type { ShopifyProductVariant } from 'types/product'
type UpdateInput = {
  current: ShopifyProductVariant
  optionName: string
  value: string
}

const buildNextOptions = (update: UpdateInput): Record<string, string> => {
  const nextOptions = update.current.selectedOptions.reduce<
    Record<string, string>
  >((acc, option) => {
    acc[option.name] = option.value
    return acc
  }, {})

  nextOptions[update.optionName] = update.value
  return nextOptions
}

const isMatchingVariant = (
  variant: ShopifyProductVariant,
  targetOptions: Record<string, string>
): boolean =>
  variant.selectedOptions.every(
    option => targetOptions[option.name] === option.value
  )

export const selectVariantByOptions = (
  variants: readonly ShopifyProductVariant[],
  update: UpdateInput
): ShopifyProductVariant | null => {
  const nextOptions = buildNextOptions(update)
  const match = variants.find(variant =>
    isMatchingVariant(variant, nextOptions)
  )
  return match ?? null
}
