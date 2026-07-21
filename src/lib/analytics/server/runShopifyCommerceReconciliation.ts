import 'server-only'

import { createHash } from 'node:crypto'
import { z } from 'zod'
import { SHOPIFY_ADMIN_API_VERSION } from '@/lib/shopify/shopifyAdminGraphql'

import type { AcceptCanonicalPurchaseResult } from './acceptCanonicalPurchase'
import { acceptCanonicalPurchase } from './acceptCanonicalPurchase'
import type { AcceptCanonicalRefundResult } from './acceptCanonicalRefund'
import { acceptCanonicalRefund } from './acceptCanonicalRefund'
import {
  claimShopifyCommerceReconciliationLease,
  type ClaimShopifyCommerceReconciliationLeaseInput,
  updateShopifyCommerceReconciliationLeaseWindow,
  type UpdateShopifyCommerceReconciliationLeaseWindowInput
} from './claimShopifyCommerceReconciliationLease'
import {
  fetchShopifyCommerceReconciliationOrdersPage,
  type FetchShopifyCommerceReconciliationOrdersPageInput,
  type FetchShopifyCommerceReconciliationOrdersPageResult
} from './fetchShopifyCommerceReconciliationOrders'
import { getVerifiedShopifyCustomerContext } from './getVerifiedShopifyCustomerContext'
import { postgresCanonicalEventStore } from './postgresCanonicalPageViewStore'
import {
  createShopifyReconciliationCommerceSourceEvidence,
  type ShopifyCommerceSourceEvent
} from './shopifyCommerceSourceEvidence'
import {
  releaseShopifyCommerceReconciliationLease,
  type ReleaseShopifyCommerceReconciliationLeaseInput,
  type ReleaseShopifyCommerceReconciliationLeaseResult
} from './releaseShopifyCommerceReconciliationLease'
import type {
  ShopifyCommerceReconciliationOrder,
  ShopifyCommerceReconciliationRefund
} from './shopifyCommerceReconciliationGraphqlSchema'
import {
  MAX_AUTOMATIC_LOOKBACK_MS,
  NORMAL_LOOKBACK_MS,
  SHOPIFY_COMMERCE_RECONCILIATION_RUNTIME_BUDGET_MS,
  type ShopifyCommerceReconciliationFailure,
  type ShopifyCommerceReconciliationLease,
  type ShopifyCommerceReconciliationRunMode,
  type ShopifyCommerceReconciliationStatus,
  type ShopifyCommerceReconciliationSummary
} from './shopifyCommerceReconciliationTypes'
import { shopifyGraphqlOrderToCanonicalPurchase } from './shopifyGraphqlOrderToCanonicalPurchase'
import { shopifyGraphqlRefundToCanonicalRefund } from './shopifyGraphqlRefundToCanonicalRefund'
import type { CanonicalEventStore } from './canonicalEventStore'
import type { CanonicalEventSourceEvidence } from './canonicalEventSourceEvidence'

const isoDateTimeSchema = z.string().datetime({ offset: true })

function hashResourceId(resourceId: string) {
  return createHash('sha256')
    .update(resourceId)
    .digest('hex')
    .slice(0, 16)
}

function emptySummary(input: {
  status: ShopifyCommerceReconciliationStatus
  windowStart: string
  windowEnd: string
  failures?: ShopifyCommerceReconciliationFailure[]
  ok?: boolean
}): ShopifyCommerceReconciliationSummary {
  return {
    ok: input.ok ?? false,
    status: input.status,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    pages: 0,
    ordersExamined: 0,
    purchaseCandidates: 0,
    purchasesAccepted: 0,
    purchasesDuplicate: 0,
    refundCandidates: 0,
    refundsAccepted: 0,
    refundsDuplicate: 0,
    watermarkAdvanced: false,
    failures: input.failures ?? []
  }
}

function runtimeBudgetExhausted(
  runStartedAt: Date,
  now: () => Date
) {
  return (
    now().getTime() - runStartedAt.getTime() >=
    SHOPIFY_COMMERCE_RECONCILIATION_RUNTIME_BUDGET_MS
  )
}

function markRuntimeTimeout(
  summary: ShopifyCommerceReconciliationSummary
) {
  summary.ok = false
  summary.status = 'runtime_timeout'
  summary.failures.push({
    resourceType: 'system',
    resourceIdHash: hashResourceId('runtime'),
    reason: 'runtime_timeout'
  })
  return summary
}

async function releaseLeaseSafely(
  releaseLease: (
    input: ReleaseShopifyCommerceReconciliationLeaseInput
  ) => Promise<ReleaseShopifyCommerceReconciliationLeaseResult>,
  input: ReleaseShopifyCommerceReconciliationLeaseInput
) {
  try {
    return await releaseLease(input)
  } catch {
    return { released: false, watermarkAdvanced: false }
  }
}

export function computeShopifyCommerceReconciliationWindow(input: {
  runStartedAt: Date
  watermark: Record<string, unknown>
}):
  | { ok: true; windowStart: string; windowEnd: string }
  | {
      ok: false
      reason:
        | 'invalid_reconciliation_watermark'
        | 'stop_historical_gap_requires_ce_2_6'
    } {
  const windowEnd = input.runStartedAt.toISOString()
  const maxLookbackStartMs =
    input.runStartedAt.getTime() - MAX_AUTOMATIC_LOOKBACK_MS
  const maxLookbackStart = new Date(
    maxLookbackStartMs
  ).toISOString()

  const rawWatermark = input.watermark.lastSuccessfulWindowEnd

  if (rawWatermark === undefined) {
    return { ok: true, windowStart: maxLookbackStart, windowEnd }
  }

  if (typeof rawWatermark !== 'string') {
    return {
      ok: false,
      reason: 'invalid_reconciliation_watermark'
    }
  }

  const parsedWatermark =
    isoDateTimeSchema.safeParse(rawWatermark)

  if (!parsedWatermark.success) {
    return {
      ok: false,
      reason: 'invalid_reconciliation_watermark'
    }
  }

  const watermarkMs = Date.parse(parsedWatermark.data)

  if (!Number.isFinite(watermarkMs)) {
    return {
      ok: false,
      reason: 'invalid_reconciliation_watermark'
    }
  }

  if (watermarkMs > input.runStartedAt.getTime()) {
    return {
      ok: false,
      reason: 'invalid_reconciliation_watermark'
    }
  }

  if (watermarkMs < maxLookbackStartMs) {
    return {
      ok: false,
      reason: 'stop_historical_gap_requires_ce_2_6'
    }
  }

  const overlapStart = new Date(
    watermarkMs - NORMAL_LOOKBACK_MS
  ).toISOString()
  const windowStart =
    overlapStart > maxLookbackStart ? overlapStart : (
      maxLookbackStart
    )

  return { ok: true, windowStart, windowEnd }
}

function nestedTruncationFailure(
  order: ShopifyCommerceReconciliationOrder
): ShopifyCommerceReconciliationFailure | null {
  if (order.lineItems.pageInfo.hasNextPage) {
    return {
      resourceType: 'order',
      resourceIdHash: hashResourceId(order.legacyResourceId),
      reason: 'order_line_items_truncated'
    }
  }

  if (order.discountApplications.pageInfo.hasNextPage) {
    return {
      resourceType: 'order',
      resourceIdHash: hashResourceId(order.legacyResourceId),
      reason: 'order_discount_applications_truncated'
    }
  }

  if (order.refunds.length === 250) {
    return {
      resourceType: 'order',
      resourceIdHash: hashResourceId(order.legacyResourceId),
      reason: 'order_refunds_truncation_ambiguous'
    }
  }

  for (const refund of order.refunds) {
    if (refund.refundLineItems.pageInfo.hasNextPage) {
      return {
        resourceType: 'refund',
        resourceIdHash: hashResourceId(refund.legacyResourceId),
        reason: 'refund_line_items_truncated'
      }
    }

    if (refund.transactions.pageInfo.hasNextPage) {
      return {
        resourceType: 'refund',
        resourceIdHash: hashResourceId(refund.legacyResourceId),
        reason: 'refund_transactions_truncated'
      }
    }
  }

  return null
}

function classifyThrownStatus(
  error: unknown
): ShopifyCommerceReconciliationStatus {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code
    switch (code) {
      case 'shopify_auth':
      case 'shopify_scope':
      case 'shopify_rate_limited':
      case 'shopify_graphql':
      case 'shopify_user_error':
        return code
      default:
        break
    }
  }

  const message =
    error instanceof Error ? error.message : String(error)

  if (message === 'shopify_auth') return 'shopify_auth'
  if (message === 'shopify_scope') return 'shopify_scope'
  if (message === 'shopify_rate_limited')
    return 'shopify_rate_limited'
  if (message === 'shopify_user_error')
    return 'shopify_user_error'
  if (message === 'shopify_graphql') return 'shopify_graphql'

  return 'mapping_invalid'
}

export type RunShopifyCommerceReconciliationDependencies = {
  claimLease: (
    input: ClaimShopifyCommerceReconciliationLeaseInput
  ) => Promise<ShopifyCommerceReconciliationLease>
  releaseLease: (
    input: ReleaseShopifyCommerceReconciliationLeaseInput
  ) => Promise<ReleaseShopifyCommerceReconciliationLeaseResult>
  updateLeaseWindow: (
    input: UpdateShopifyCommerceReconciliationLeaseWindowInput
  ) => Promise<boolean>
  fetchOrdersPage: (
    input: FetchShopifyCommerceReconciliationOrdersPageInput
  ) => Promise<FetchShopifyCommerceReconciliationOrdersPageResult>
  acceptPurchase: (input: {
    payload: unknown
    requestContext: ReturnType<
      typeof getVerifiedShopifyCustomerContext
    >
    sourceEvidence: CanonicalEventSourceEvidence
    store: CanonicalEventStore
  }) => Promise<AcceptCanonicalPurchaseResult>
  acceptRefund: (input: {
    payload: unknown
    requestContext: Record<string, never>
    sourceEvidence: CanonicalEventSourceEvidence
    store: CanonicalEventStore
  }) => Promise<AcceptCanonicalRefundResult>
  createSourceEvidence: typeof createShopifyReconciliationCommerceSourceEvidence
  mapPurchase: typeof shopifyGraphqlOrderToCanonicalPurchase
  mapRefund: typeof shopifyGraphqlRefundToCanonicalRefund
  store: CanonicalEventStore
  now: () => Date
}

const defaultDependencies: RunShopifyCommerceReconciliationDependencies =
  {
    claimLease: claimShopifyCommerceReconciliationLease,
    releaseLease: releaseShopifyCommerceReconciliationLease,
    updateLeaseWindow:
      updateShopifyCommerceReconciliationLeaseWindow,
    fetchOrdersPage:
      fetchShopifyCommerceReconciliationOrdersPage,
    acceptPurchase: acceptCanonicalPurchase,
    acceptRefund: acceptCanonicalRefund,
    createSourceEvidence:
      createShopifyReconciliationCommerceSourceEvidence,
    mapPurchase: shopifyGraphqlOrderToCanonicalPurchase,
    mapRefund: shopifyGraphqlRefundToCanonicalRefund,
    store: postgresCanonicalEventStore,
    now: () => new Date()
  }

export type RunShopifyCommerceReconciliationInput = {
  runMode?: ShopifyCommerceReconciliationRunMode
}

export async function runShopifyCommerceReconciliation(
  input: RunShopifyCommerceReconciliationInput = {},
  dependencies: RunShopifyCommerceReconciliationDependencies = defaultDependencies
): Promise<ShopifyCommerceReconciliationSummary> {
  const runMode = input.runMode ?? 'dry-run'
  const runStartedAt = dependencies.now()
  const provisionalWindowEnd = runStartedAt.toISOString()
  const provisionalWindowStart = new Date(
    runStartedAt.getTime() - MAX_AUTOMATIC_LOOKBACK_MS
  ).toISOString()

  const lease = await dependencies.claimLease({
    activeRunStartedAt: provisionalWindowEnd,
    runMode
  })

  if (lease.status === 'blocked') {
    return emptySummary({
      status: 'lease_blocked',
      windowStart: provisionalWindowStart,
      windowEnd: provisionalWindowEnd,
      ok: true,
      failures: [
        {
          resourceType: 'lease',
          resourceIdHash: hashResourceId(lease.leaseOwner),
          reason: 'lease_blocked'
        }
      ]
    })
  }

  if (lease.status === 'unavailable') {
    return emptySummary({
      status: 'postgres_unavailable',
      windowStart: provisionalWindowStart,
      windowEnd: provisionalWindowEnd,
      failures: [
        {
          resourceType: 'system',
          resourceIdHash: hashResourceId('postgres'),
          reason: 'postgres_unavailable'
        }
      ]
    })
  }

  const window = computeShopifyCommerceReconciliationWindow({
    runStartedAt,
    watermark: lease.metadata
  })

  if (!window.ok) {
    await releaseLeaseSafely(dependencies.releaseLease, {
      lease
    })
    const historicalGap =
      window.reason === 'stop_historical_gap_requires_ce_2_6'
    return emptySummary({
      status: window.reason,
      windowStart: provisionalWindowStart,
      windowEnd: provisionalWindowEnd,
      failures: [
        {
          resourceType: 'system',
          resourceIdHash: hashResourceId('watermark'),
          reason:
            historicalGap ?
              'STOP_HISTORICAL_GAP_REQUIRES_CE_2_6'
            : 'invalid_reconciliation_watermark'
        }
      ]
    })
  }

  const activeWindowUpdated =
    await dependencies.updateLeaseWindow({
      activeWindowEnd: window.windowEnd,
      activeWindowStart: window.windowStart,
      lease
    })

  if (!activeWindowUpdated) {
    await releaseLeaseSafely(dependencies.releaseLease, {
      lease
    })
    return emptySummary({
      status: 'postgres_unavailable',
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
      failures: [
        {
          resourceType: 'lease',
          resourceIdHash: hashResourceId(lease.leaseOwner),
          reason: 'active_window_metadata_update_failed'
        }
      ]
    })
  }

  if (runtimeBudgetExhausted(runStartedAt, dependencies.now)) {
    await releaseLeaseSafely(dependencies.releaseLease, {
      lease
    })
    return emptySummary({
      status: 'runtime_timeout',
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
      failures: [
        {
          resourceType: 'system',
          resourceIdHash: hashResourceId('runtime'),
          reason: 'runtime_timeout'
        }
      ]
    })
  }

  const summary: ShopifyCommerceReconciliationSummary =
    emptySummary({
      status: 'completed',
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
      ok: true
    })

  let shouldAdvanceWatermark = false

  try {
    let after: string | null = null
    let hasNextPage = true

    while (hasNextPage) {
      if (
        runtimeBudgetExhausted(runStartedAt, dependencies.now)
      ) {
        return markRuntimeTimeout(summary)
      }

      let page: FetchShopifyCommerceReconciliationOrdersPageResult

      try {
        page = await dependencies.fetchOrdersPage({
          after,
          windowStartIso: window.windowStart
        })
      } catch (error) {
        const status = classifyThrownStatus(error)
        summary.ok = false
        summary.status =
          status === 'mapping_invalid' ?
            'shopify_graphql'
          : status
        summary.failures.push({
          resourceType: 'page',
          resourceIdHash: hashResourceId(after ?? 'first'),
          reason: summary.status
        })
        return summary
      }

      if (
        runtimeBudgetExhausted(runStartedAt, dependencies.now)
      ) {
        return markRuntimeTimeout(summary)
      }

      summary.pages += 1

      for (const order of page.nodes) {
        if (
          runtimeBudgetExhausted(runStartedAt, dependencies.now)
        ) {
          return markRuntimeTimeout(summary)
        }

        summary.ordersExamined += 1

        const truncation = nestedTruncationFailure(order)
        if (truncation) {
          summary.ok = false
          summary.status = 'partial_page_failure'
          summary.failures.push(truncation)
          return summary
        }

        if (order.displayFinancialStatus === 'PAID') {
          summary.purchaseCandidates += 1

          let purchase: ReturnType<
            typeof shopifyGraphqlOrderToCanonicalPurchase
          >

          try {
            purchase = dependencies.mapPurchase(order)
          } catch {
            summary.ok = false
            summary.status = 'mapping_invalid'
            summary.failures.push({
              resourceType: 'order',
              resourceIdHash: hashResourceId(
                order.legacyResourceId
              ),
              reason: 'purchase_mapping_invalid'
            })
            return summary
          }

          if (runMode === 'accept') {
            try {
              const sourceEvidence =
                dependencies.createSourceEvidence({
                  apiVersion: SHOPIFY_ADMIN_API_VERSION,
                  event: purchase as ShopifyCommerceSourceEvent,
                  observedAt: runStartedAt
                })
              const result = await dependencies.acceptPurchase({
                payload: purchase,
                requestContext:
                  getVerifiedShopifyCustomerContext(purchase),
                sourceEvidence,
                store: dependencies.store
              })

              if (result.status === 'accepted') {
                summary.purchasesAccepted += 1
              } else {
                summary.purchasesDuplicate += 1
              }
            } catch {
              summary.ok = false
              summary.status = 'canonical_acceptance'
              summary.failures.push({
                resourceType: 'order',
                resourceIdHash: hashResourceId(
                  order.legacyResourceId
                ),
                reason: 'purchase_canonical_acceptance_failed'
              })
              return summary
            }
          }

          if (
            runtimeBudgetExhausted(
              runStartedAt,
              dependencies.now
            )
          ) {
            return markRuntimeTimeout(summary)
          }
        }

        for (const refund of order.refunds) {
          if (
            runtimeBudgetExhausted(
              runStartedAt,
              dependencies.now
            )
          ) {
            return markRuntimeTimeout(summary)
          }

          summary.refundCandidates += 1

          let canonicalRefund: ReturnType<
            typeof shopifyGraphqlRefundToCanonicalRefund
          >

          try {
            canonicalRefund = dependencies.mapRefund({
              order,
              refund
            })
          } catch {
            summary.ok = false
            summary.status = 'mapping_invalid'
            summary.failures.push({
              resourceType: 'refund',
              resourceIdHash: hashResourceId(
                refund.legacyResourceId
              ),
              reason: 'refund_mapping_invalid'
            })
            return summary
          }

          if (runMode === 'accept') {
            try {
              const sourceEvidence =
                dependencies.createSourceEvidence({
                  apiVersion: SHOPIFY_ADMIN_API_VERSION,
                  event:
                    canonicalRefund as ShopifyCommerceSourceEvent,
                  observedAt: runStartedAt
                })
              const result = await dependencies.acceptRefund({
                payload: canonicalRefund,
                requestContext: {},
                sourceEvidence,
                store: dependencies.store
              })

              if (result.status === 'accepted') {
                summary.refundsAccepted += 1
              } else {
                summary.refundsDuplicate += 1
              }
            } catch {
              summary.ok = false
              summary.status = 'canonical_acceptance'
              summary.failures.push({
                resourceType: 'refund',
                resourceIdHash: hashResourceId(
                  refund.legacyResourceId
                ),
                reason: 'refund_canonical_acceptance_failed'
              })
              return summary
            }
          }

          if (
            runtimeBudgetExhausted(
              runStartedAt,
              dependencies.now
            )
          ) {
            return markRuntimeTimeout(summary)
          }
        }
      }

      hasNextPage = page.hasNextPage
      after = page.endCursor

      if (hasNextPage && !after) {
        summary.ok = false
        summary.status = 'partial_page_failure'
        summary.failures.push({
          resourceType: 'page',
          resourceIdHash: hashResourceId('cursor'),
          reason: 'missing_end_cursor'
        })
        return summary
      }
    }

    if (runtimeBudgetExhausted(runStartedAt, dependencies.now)) {
      return markRuntimeTimeout(summary)
    }

    shouldAdvanceWatermark = runMode === 'accept'
    summary.status = 'completed'
    summary.ok = true
  } finally {
    const releaseResult = await releaseLeaseSafely(
      dependencies.releaseLease,
      {
        lease,
        ...(shouldAdvanceWatermark ?
          {
            watermark: {
              lastSuccessfulWindowEnd: window.windowEnd,
              lastSuccessfulRunCompletedAt: dependencies
                .now()
                .toISOString()
            }
          }
        : {})
      }
    )

    if (
      shouldAdvanceWatermark &&
      !releaseResult.watermarkAdvanced
    ) {
      summary.ok = false
      summary.status = 'postgres_unavailable'
      summary.failures.push({
        resourceType: 'system',
        resourceIdHash: hashResourceId('watermark'),
        reason: 'watermark_release_unconfirmed'
      })
    } else if (summary.ok && !releaseResult.released) {
      summary.ok = false
      summary.status = 'postgres_unavailable'
      summary.failures.push({
        resourceType: 'lease',
        resourceIdHash: hashResourceId(lease.leaseOwner),
        reason: 'lease_release_unconfirmed'
      })
    }

    summary.watermarkAdvanced = releaseResult.watermarkAdvanced
  }

  return summary
}

export type {
  ShopifyCommerceReconciliationOrder,
  ShopifyCommerceReconciliationRefund
}
