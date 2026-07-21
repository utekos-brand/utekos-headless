import 'server-only'

import { getPostgresClient } from '@/lib/db/getPostgresClient'
import type {
  ShopifyCommerceReconciliationLease,
  ShopifyCommerceReconciliationWatermark
} from './shopifyCommerceReconciliationTypes'

type SqlClient = {
  <T>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T>
  json: (value: unknown) => unknown
}

export type ReleaseShopifyCommerceReconciliationLeaseInput = {
  lease: ShopifyCommerceReconciliationLease
  watermark?: ShopifyCommerceReconciliationWatermark
}

export type ReleaseShopifyCommerceReconciliationLeaseResult = {
  released: boolean
  watermarkAdvanced: boolean
}

export type ReleaseShopifyCommerceReconciliationLeaseDependencies =
  { getSql?: () => SqlClient | null; nowIso?: () => string }

export async function releaseShopifyCommerceReconciliationLease(
  input: ReleaseShopifyCommerceReconciliationLeaseInput,
  dependencies: ReleaseShopifyCommerceReconciliationLeaseDependencies = {}
): Promise<ReleaseShopifyCommerceReconciliationLeaseResult> {
  if (input.lease.status !== 'acquired') {
    return { released: false, watermarkAdvanced: false }
  }

  const getSql =
    dependencies.getSql ??
    (() => getPostgresClient() as SqlClient | null)
  const sql = getSql()

  if (!sql) {
    return { released: false, watermarkAdvanced: false }
  }

  const releasedAt =
    dependencies.nowIso?.() ?? new Date().toISOString()
  const metadataPatch = {
    releasedAt,
    ...(input.watermark?.lastSuccessfulWindowEnd ?
      {
        lastSuccessfulWindowEnd:
          input.watermark.lastSuccessfulWindowEnd
      }
    : {}),
    ...(input.watermark?.lastSuccessfulRunCompletedAt ?
      {
        lastSuccessfulRunCompletedAt:
          input.watermark.lastSuccessfulRunCompletedAt
      }
    : {})
  }

  try {
    const rows = await sql<{ jobName: string }[]>`
      update ops.integration_job_leases
      set
        expires_at = now(),
        updated_at = now(),
        metadata = coalesce(metadata, '{}'::jsonb) || ${sql.json(metadataPatch)}
      where
        job_name = ${input.lease.jobName}
        and lease_owner = ${input.lease.leaseOwner}
      returning job_name as "jobName"
    `

    const released = rows.length > 0
    const watermarkAdvanced =
      released &&
      Boolean(
        input.watermark?.lastSuccessfulWindowEnd &&
        input.watermark.lastSuccessfulRunCompletedAt
      )

    return { released, watermarkAdvanced }
  } catch {
    console.error(
      '[shopify-commerce-reconciliation] Failed to release lease'
    )
    return { released: false, watermarkAdvanced: false }
  }
}
