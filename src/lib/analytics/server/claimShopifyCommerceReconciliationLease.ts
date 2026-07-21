import 'server-only'

import { randomUUID } from 'node:crypto'

import { getPostgresClient } from '@/lib/db/getPostgresClient'
import {
  SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME,
  SHOPIFY_COMMERCE_RECONCILIATION_LEASE_SECONDS,
  type ShopifyCommerceReconciliationLease,
  type ShopifyCommerceReconciliationRunMode,
  type ShopifyCommerceReconciliationWatermark
} from './shopifyCommerceReconciliationTypes'

type LeaseRow = {
  jobName: string
  leaseOwner: string
  acquiredAt: Date
  expiresAt: Date
  metadata: Record<string, unknown> | null
}

type SqlClient = {
  <T>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T>
  json: (value: unknown) => unknown
}

export type ClaimShopifyCommerceReconciliationLeaseInput = {
  activeRunStartedAt: string
  runMode: ShopifyCommerceReconciliationRunMode
}

export type ClaimShopifyCommerceReconciliationLeaseDependencies =
  {
    getSql?: () => SqlClient | null
    createLeaseOwner?: () => string
  }

export type UpdateShopifyCommerceReconciliationLeaseWindowInput =
  {
    activeWindowEnd: string
    activeWindowStart: string
    lease: ShopifyCommerceReconciliationLease
  }

export type UpdateShopifyCommerceReconciliationLeaseWindowDependencies =
  { getSql?: () => SqlClient | null }

function readWatermark(
  metadata: Record<string, unknown> | null | undefined
): ShopifyCommerceReconciliationWatermark {
  if (!metadata || typeof metadata !== 'object') {
    return {}
  }

  const lastSuccessfulWindowEnd =
    typeof metadata.lastSuccessfulWindowEnd === 'string' ?
      metadata.lastSuccessfulWindowEnd
    : undefined
  const lastSuccessfulRunCompletedAt =
    typeof metadata.lastSuccessfulRunCompletedAt === 'string' ?
      metadata.lastSuccessfulRunCompletedAt
    : undefined

  return {
    ...(lastSuccessfulWindowEnd ?
      { lastSuccessfulWindowEnd }
    : {}),
    ...(lastSuccessfulRunCompletedAt ?
      { lastSuccessfulRunCompletedAt }
    : {})
  }
}

function mapAcquired(
  row: LeaseRow
): Extract<
  ShopifyCommerceReconciliationLease,
  { status: 'acquired' }
> {
  return {
    status: 'acquired',
    jobName: SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME,
    leaseOwner: row.leaseOwner,
    acquiredAt: row.acquiredAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    metadata: {
      ...readWatermark(row.metadata),
      ...(row.metadata ?? {})
    }
  }
}

export async function claimShopifyCommerceReconciliationLease(
  input: ClaimShopifyCommerceReconciliationLeaseInput,
  dependencies: ClaimShopifyCommerceReconciliationLeaseDependencies = {}
): Promise<ShopifyCommerceReconciliationLease> {
  const getSql =
    dependencies.getSql ??
    (() => getPostgresClient() as SqlClient | null)
  const createLeaseOwner =
    dependencies.createLeaseOwner ?? (() => randomUUID())
  const sql = getSql()
  const leaseOwner = createLeaseOwner()
  const activeMetadata = {
    activeRunStartedAt: input.activeRunStartedAt,
    runMode: input.runMode
  }

  if (!sql) {
    return {
      status: 'unavailable',
      jobName: SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME,
      leaseOwner,
      reason: 'postgres_unavailable'
    }
  }

  try {
    const claimedRows = await sql<LeaseRow[]>`
      with refreshed_expired_lease as (
        update ops.integration_job_leases
        set
          lease_owner = ${leaseOwner},
          acquired_at = now(),
          expires_at = now() + (${SHOPIFY_COMMERCE_RECONCILIATION_LEASE_SECONDS} * interval '1 second'),
          updated_at = now(),
          metadata = coalesce(metadata, '{}'::jsonb) || ${sql.json(activeMetadata)}
        where
          job_name = ${SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME}
          and expires_at <= now()
        returning
          job_name as "jobName",
          lease_owner as "leaseOwner",
          acquired_at as "acquiredAt",
          expires_at as "expiresAt",
          metadata
      ),
      inserted_lease as (
        insert into ops.integration_job_leases (
          job_name,
          lease_owner,
          acquired_at,
          expires_at,
          metadata
        )
        values (
          ${SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME},
          ${leaseOwner},
          now(),
          now() + (${SHOPIFY_COMMERCE_RECONCILIATION_LEASE_SECONDS} * interval '1 second'),
          ${sql.json(activeMetadata)}
        )
        on conflict (job_name) do nothing
        returning
          job_name as "jobName",
          lease_owner as "leaseOwner",
          acquired_at as "acquiredAt",
          expires_at as "expiresAt",
          metadata
      )
      select * from inserted_lease
      union all
      select * from refreshed_expired_lease
      limit 1
    `

    const claimedRow = claimedRows[0]
    if (claimedRow) {
      return mapAcquired(claimedRow)
    }

    const activeRows = await sql<LeaseRow[]>`
      select
        job_name as "jobName",
        lease_owner as "leaseOwner",
        acquired_at as "acquiredAt",
        expires_at as "expiresAt",
        metadata
      from ops.integration_job_leases
      where job_name = ${SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME}
      limit 1
    `
    const activeRow = activeRows[0]

    return {
      status: 'blocked',
      jobName: SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME,
      leaseOwner: activeRow?.leaseOwner ?? 'unknown',
      acquiredAt: activeRow?.acquiredAt.toISOString() ?? null,
      expiresAt: activeRow?.expiresAt.toISOString() ?? null
    }
  } catch {
    return {
      status: 'unavailable',
      jobName: SHOPIFY_COMMERCE_RECONCILIATION_JOB_NAME,
      leaseOwner,
      reason: 'postgres_unavailable'
    }
  }
}

export async function updateShopifyCommerceReconciliationLeaseWindow(
  input: UpdateShopifyCommerceReconciliationLeaseWindowInput,
  dependencies: UpdateShopifyCommerceReconciliationLeaseWindowDependencies = {}
) {
  if (input.lease.status !== 'acquired') return false

  const getSql =
    dependencies.getSql ??
    (() => getPostgresClient() as SqlClient | null)
  const sql = getSql()

  if (!sql) return false

  try {
    const rows = await sql<{ jobName: string }[]>`
      update ops.integration_job_leases
      set
        updated_at = now(),
        metadata = coalesce(metadata, '{}'::jsonb) || ${sql.json(
          {
            activeWindowEnd: input.activeWindowEnd,
            activeWindowStart: input.activeWindowStart
          }
        )}
      where
        job_name = ${input.lease.jobName}
        and lease_owner = ${input.lease.leaseOwner}
        and expires_at > now()
      returning job_name as "jobName"
    `

    return rows.length === 1
  } catch {
    return false
  }
}
