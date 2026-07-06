import { createMissingLabelCounts } from '../createMissingLabelCounts'
import type { MetaCatalogSyncSummary } from '../metaCatalogTypes'

export function createSyncSummary(): MetaCatalogSyncSummary {
  return {
    productsScanned: 0,
    productsExcluded: 0,
    inactiveProductsSkipped: 0,
    productsMissingGroupId: 0,
    variantsScanned: 0,
    variantsExcluded: 0,
    variantsMissingIdentifiers: 0,
    variantsQueued: 0,
    missingLabels: createMissingLabelCounts()
  }
}
