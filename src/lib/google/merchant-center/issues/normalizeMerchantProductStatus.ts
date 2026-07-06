import type { MerchantProcessedProduct } from '../merchantCenterTypes'

export function normalizeMerchantProductStatus(product: MerchantProcessedProduct) {
  return {
    name: product.name,
    offerId: product.offerId,
    contentLanguage: product.contentLanguage,
    feedLabel: product.feedLabel,
    dataSource: product.dataSource ?? null,
    title: product.productAttributes?.title ?? null,
    link: product.productAttributes?.link ?? null,
    canonicalLink: product.productAttributes?.canonicalLink ?? null,
    imageLink: product.productAttributes?.imageLink ?? null,
    destinationStatuses:
      product.productStatus?.destinationStatuses?.map(destinationStatus => ({
        reportingContext: destinationStatus.reportingContext ?? null,
        approvedCountries: destinationStatus.approvedCountries ?? [],
        pendingCountries: destinationStatus.pendingCountries ?? [],
        disapprovedCountries: destinationStatus.disapprovedCountries ?? []
      })) ?? [],
    itemLevelIssues:
      product.productStatus?.itemLevelIssues?.map(issue => ({
        code: issue.code ?? null,
        severity: issue.severity ?? 'SEVERITY_UNSPECIFIED',
        attribute: issue.attribute ?? null,
        description: issue.description ?? null,
        detail: issue.detail ?? null,
        documentation: issue.documentation ?? null,
        applicableCountries: issue.applicableCountries ?? []
      })) ?? [],
    creationDate: product.productStatus?.creationDate ?? null,
    lastUpdateDate: product.productStatus?.lastUpdateDate ?? null,
    googleExpirationDate: product.productStatus?.googleExpirationDate ?? null
  }
}
