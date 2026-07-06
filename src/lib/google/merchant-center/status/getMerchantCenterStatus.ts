import { getAllProductsForCatalogSync } from '@/lib/shopify/admin'

import { getMerchantCenterConfig } from '../config'
import { resolveMerchantProductDataSource } from '../dataSources/resolveMerchantProductDataSource'
import { getMerchantApiDiagnostic } from '../getMerchantApiDiagnostic'
import { listMerchantAccountIssues } from '../issues/listMerchantAccountIssues'
import { normalizeMerchantAccountIssue } from '../issues/normalizeMerchantAccountIssue'
import { normalizeMerchantProductStatus } from '../issues/normalizeMerchantProductStatus'
import { listMerchantAggregateProductStatuses } from '../products/listMerchantAggregateProductStatuses'
import { listMerchantProcessedProducts } from '../products/listMerchantProcessedProducts'
import { auditMerchantSiteSignals } from '../site/auditMerchantSiteSignals'

export async function getMerchantCenterStatus() {
  const config = getMerchantCenterConfig()
  const catalogProducts = await getAllProductsForCatalogSync()
  const sampleProductHandle = catalogProducts.find(
    product => product.status === 'ACTIVE'
  )?.handle
  const siteAudit = await auditMerchantSiteSignals(sampleProductHandle)

  try {
    const dataSource = await resolveMerchantProductDataSource()
    const [processedProducts, aggregateStatuses, accountIssues] =
      await Promise.all([
        listMerchantProcessedProducts(),
        listMerchantAggregateProductStatuses(),
        listMerchantAccountIssues()
      ])

    const managedProducts = processedProducts.filter(
      product => product.dataSource === dataSource.name
    )
    const productsWithIssues = managedProducts
      .map(normalizeMerchantProductStatus)
      .filter(product => product.itemLevelIssues.length > 0)

    return {
      checkedAt: new Date().toISOString(),
      accountId: config.accountId,
      merchantApi: {
        ok: true
      },
      dataSource: {
        name: dataSource.name,
        displayName: dataSource.displayName,
        dataSourceId: dataSource.dataSourceId
      },
      totals: {
        catalogProducts: catalogProducts.length,
        processedProducts: processedProducts.length,
        managedProducts: managedProducts.length,
        managedProductsWithIssues: productsWithIssues.length
      },
      aggregateProductStatuses: aggregateStatuses,
      accountIssues: accountIssues.map(normalizeMerchantAccountIssue),
      sampleProductsWithIssues: productsWithIssues.slice(0, 50),
      siteAudit
    }
  } catch (error) {
    return {
      checkedAt: new Date().toISOString(),
      accountId: config.accountId,
      merchantApi: {
        ok: false,
        error: getMerchantApiDiagnostic(error)
      },
      dataSource: null,
      totals: {
        catalogProducts: catalogProducts.length,
        processedProducts: null,
        managedProducts: null,
        managedProductsWithIssues: null
      },
      aggregateProductStatuses: [],
      accountIssues: [],
      sampleProductsWithIssues: [],
      siteAudit
    }
  }
}
