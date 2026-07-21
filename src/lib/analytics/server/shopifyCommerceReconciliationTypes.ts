export const SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME =
  'shopify_commerce_reconciliation' as const

export const SHOPIFY_COMMERCE_RECONCILIATION_LEASE_SECONDS = 900

export const NORMAL_LOOKBACK_MS = 30 * 60 * 1000

export const MAX_AUTOMATIC_LOOKBACK_MS = 24 * 60 * 60 * 1000

export const SHOPIFY_COMMERCE_RECONCILIATION_RUNTIME_BUDGET_MS =
  45 * 1000

export const SHOPIFY_COMMERCE_RECONCILIATION_PAGE_SIZE = 50

export type ShopifyCommerceReconciliationRunMode =
  | 'dry-run'
  | 'accept'

export type ShopifyCommerceReconciliationStatus =
  | 'completed'
  | 'lease_blocked'
  | 'partial_page_failure'
  | 'invalid_reconciliation_watermark'
  | 'runtime_timeout'
  | 'postgres_unavailable'
  | 'shopify_auth'
  | 'shopify_scope'
  | 'shopify_rate_limited'
  | 'shopify_graphql'
  | 'shopify_user_error'
  | 'mapping_invalid'
  | 'canonical_acceptance'
  | 'stop_historical_gap_requires_ce_2_6'

export type ShopifyCommerceReconciliationFailure = {
  resourceType: 'order' | 'refund' | 'page' | 'lease' | 'system'
  resourceIdHash: string
  reason: string
}

export type ShopifyCommerceReconciliationSummary = {
  ok: boolean
  status: ShopifyCommerceReconciliationStatus
  windowStart: string
  windowEnd: string
  pages: number
  ordersExamined: number
  purchaseCandidates: number
  purchasesAccepted: number
  purchasesDuplicate: number
  refundCandidates: number
  refundsAccepted: number
  refundsDuplicate: number
  watermarkAdvanced: boolean
  failures: ShopifyCommerceReconciliationFailure[]
}

export type ShopifyCommerceReconciliationWatermark = {
  lastSuccessfulWindowEnd?: string
  lastSuccessfulRunCompletedAt?: string
}

export type ShopifyCommerceReconciliationLease =
  | {
      status: 'acquired'
      jobName: typeof SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME
      leaseOwner: string
      acquiredAt: string
      expiresAt: string
      metadata: ShopifyCommerceReconciliationWatermark &
        Record<string, unknown>
    }
  | {
      status: 'blocked'
      jobName: typeof SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME
      leaseOwner: string
      acquiredAt: string | null
      expiresAt: string | null
    }
  | {
      status: 'unavailable'
      jobName: typeof SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME
      leaseOwner: string
      reason: string
    }
