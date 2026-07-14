const MICROSOFT_PRODUCT_CATEGORIES = {
  coatsAndJackets: '5598',
  compressionSacks: '5636',
  outerwear: '203'
} as const

const MICROSOFT_PRODUCT_CATEGORY_BY_HANDLE: Record<string, string> = {
  comfyrobe: MICROSOFT_PRODUCT_CATEGORIES.coatsAndJackets,
  'utekos-dun': MICROSOFT_PRODUCT_CATEGORIES.outerwear,
  'utekos-mikrofiber': MICROSOFT_PRODUCT_CATEGORIES.outerwear,
  'utekos-techdown': MICROSOFT_PRODUCT_CATEGORIES.outerwear,
  'utekos-stapper': MICROSOFT_PRODUCT_CATEGORIES.compressionSacks
}

export function getMicrosoftMerchantProductCategory(
  productHandle: string
): string {
  const productCategory =
    MICROSOFT_PRODUCT_CATEGORY_BY_HANDLE[productHandle]

  if (!productCategory) {
    throw new Error(
      `Microsoft Merchant product ${productHandle} is missing a Bing category mapping`
    )
  }

  return productCategory
}
