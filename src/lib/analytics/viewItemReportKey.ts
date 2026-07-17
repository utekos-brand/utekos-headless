export function createViewItemReportKey(
  productId: string,
  variantId: string
) {
  return JSON.stringify([productId, variantId])
}
