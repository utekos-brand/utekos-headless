// Path: src/lib/tracking/meta/catalogSync.ts

import { FacebookAdsApi, ProductCatalog } from 'facebook-nodejs-business-sdk'
import { getAllProductsForMetaSync } from '@/lib/shopify/admin'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import { buildMetaCatalogItemPayload } from './buildMetaCatalogItemPayload'
import { extractMetaCatalogCustomLabels } from './extractMetaCatalogCustomLabels'
import type { MetaCatalogSyncResult } from './metaCatalogTypes'
import { resolveMetaCatalogAccessToken } from './resolveMetaCatalogAccessToken'
import { createSyncSummary } from './utils/createSyncSummary'
import { createErrorDetails } from './utils/createErrorDetails'
import { CATALOG_ID, EXCLUDED_PRODUCT_IDS, EXCLUDED_VARIANT_IDS } from './constants'

export async function syncProductsToMetaCatalog(): Promise<MetaCatalogSyncResult> {
  const summary = createSyncSummary()
  const resolvedToken = resolveMetaCatalogAccessToken()

  if (!resolvedToken) {
    return {
      success: false,
      catalogId: CATALOG_ID,
      summary,
      error: {
        message:
          'Missing Meta catalog token. Expected META_SYSTEM_USER_TOKEN, CATALOG_ACCESS_TOKEN, or META_ACCESS_TOKEN.'
      }
    }
  }

  FacebookAdsApi.init(resolvedToken.token)

  try {
    console.log('[Meta Catalog] Starting sync...')

    const products = await getAllProductsForMetaSync()
    const batchRequests: Array<{
      method: 'UPDATE'
      data: ReturnType<typeof buildMetaCatalogItemPayload>
    }> = []

    for (const product of products) {
      summary.productsScanned += 1

      const retailerProductGroupId = cleanShopifyId(product.id)
      const variantEdges = product.variants.edges

      if (!retailerProductGroupId) {
        summary.productsMissingGroupId += 1
        summary.variantsMissingIdentifiers += variantEdges.length
        continue
      }

      if (EXCLUDED_PRODUCT_IDS.includes(retailerProductGroupId)) {
        summary.productsExcluded += 1
        summary.variantsExcluded += variantEdges.length
        continue
      }

      if (product.status !== 'ACTIVE') {
        summary.inactiveProductsSkipped += 1
        continue
      }

      for (const variantEdge of variantEdges) {
        summary.variantsScanned += 1

        const variant = variantEdge.node
        const retailerId = cleanShopifyId(variant.id)

        if (!retailerId) {
          summary.variantsMissingIdentifiers += 1
          continue
        }

        if (EXCLUDED_VARIANT_IDS.includes(retailerId)) {
          summary.variantsExcluded += 1
          continue
        }

        const { labels, missingLabels } = extractMetaCatalogCustomLabels(variant)
        for (const missingLabel of missingLabels) {
          summary.missingLabels[missingLabel] += 1
        }

        batchRequests.push({
          method: 'UPDATE',
          data: buildMetaCatalogItemPayload({
            product,
            variant,
            retailerId,
            retailerProductGroupId,
            customLabels: labels
          })
        })

        summary.variantsQueued += 1
      }
    }

    if (batchRequests.length === 0) {
      console.log('[Meta Catalog] No variants queued for sync.')

      return {
        success: true,
        catalogId: CATALOG_ID,
        tokenSource: resolvedToken.source,
        summary,
        batchResponse: null
      }
    }

    const catalog = new ProductCatalog(CATALOG_ID)

    const batchResponse = await catalog.createItemsBatch([], {
      item_type: 'PRODUCT_ITEM',
      requests: batchRequests
    })

    console.log('[Meta Catalog] Sync successful.')

    return {
      success: true,
      catalogId: CATALOG_ID,
      tokenSource: resolvedToken.source,
      summary,
      batchResponse
    }
  } catch (error) {
    const errorDetails = createErrorDetails(error)

    console.error('[Meta Catalog] Sync failed:', errorDetails)

    return {
      success: false,
      catalogId: CATALOG_ID,
      tokenSource: resolvedToken.source,
      summary,
      error: errorDetails
    }
  }
}
