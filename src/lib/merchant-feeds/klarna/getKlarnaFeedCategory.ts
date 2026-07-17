const KLARNA_CATEGORY_BY_HANDLE: Record<string, string> = {
  comfyrobe: 'Klær > Unisex > Jakker og kåper',
  'utekos-dun': 'Klær > Unisex > Outerwear',
  'utekos-mikrofiber': 'Klær > Unisex > Outerwear',
  'utekos-techdown': 'Klær > Unisex > Outerwear',
  'utekos-stapper': 'Sport og fritid > Friluftsliv > Tilbehør'
}

export function getKlarnaFeedCategory(
  productHandle: string,
  productType: string | null
): string {
  const mappedCategory = KLARNA_CATEGORY_BY_HANDLE[productHandle]

  if (mappedCategory) {
    return mappedCategory
  }

  const normalizedProductType = productType?.trim()

  if (normalizedProductType) {
    return `Klær > Unisex > ${normalizedProductType}`
  }

  throw new Error(
    `Klarna feed product ${productHandle} is missing a category mapping`
  )
}
