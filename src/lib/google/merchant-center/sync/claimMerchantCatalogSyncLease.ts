import 'server-only'

import { randomUUID } from 'node:crypto'

import { getPostgresClient } from '@/lib/db/getPostgresClient'

import type { MerchantCatalogSyncLease } from './MerchantCatalogSyncLease'

const MERCHANT_CATALOG_SYNC_JOB_NAME = 'google_merchant_catalog_sync'
const MERCHANT_CATALOG_SYNC_LEASE_SECONDS = 15 * 60

type LeaseRow = {
  jobName: string
  leaseOwner: string
  acquiredAt: Date
  expiresAt: Date
}

type LeaseMetadata = {
  dryRun?: boolean
  accountId?: string
}

function mapLeaseRow(row: LeaseRow): Extract<MerchantCatalogSyncLease, { status: 'acquired' }> {
  return {
    status: 'acquired',
    jobName: row.jobName,
    leaseOwner: row.leaseOwner,
    acquiredAt: row.acquiredAt.toISOString(),
    expiresAt: row.expiresAt.toISOString()
  }
}

export async function claimMerchantCatalogSyncLease(
  metadata: LeaseMetadata
): Promise<MerchantCatalogSyncLease> {
  const sql = getPostgresClient()
  const leaseOwner = randomUUID()

  if (!sql) {
    return {
      status: 'unavailable',
      jobName: MERCHANT_CATALOG_SYNC_JOB_NAME,
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
          expires_at = now() + (${MERCHANT_CATALOG_SYNC_LEASE_SECONDS} * interval '1 second'),
          updated_at = now(),
          metadata = ${sql.json(metadata)}
        where
          job_name = ${MERCHANT_CATALOG_SYNC_JOB_NAME}
          and expires_at <= now()
        returning
          job_name as "jobName",
          lease_owner as "leaseOwner",
          acquired_at as "acquiredAt",
          expires_at as "expiresAt"
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
          ${MERCHANT_CATALOG_SYNC_JOB_NAME},
          ${leaseOwner},
          now(),
          now() + (${MERCHANT_CATALOG_SYNC_LEASE_SECONDS} * interval '1 second'),
          ${sql.json(metadata)}
        )
        on conflict (job_name) do nothing
        returning
          job_name as "jobName",
          lease_owner as "leaseOwner",
          acquired_at as "acquiredAt",
          expires_at as "expiresAt"
      )
      select * from inserted_lease
      union all
      select * from refreshed_expired_lease
      limit 1
    `

    const claimedRow = claimedRows[0]
    if (claimedRow) {
      return mapLeaseRow(claimedRow)
    }

    const activeRows = await sql<LeaseRow[]>`
      select
        job_name as "jobName",
        lease_owner as "leaseOwner",
        acquired_at as "acquiredAt",
        expires_at as "expiresAt"
      from ops.integration_job_leases
      where job_name = ${MERCHANT_CATALOG_SYNC_JOB_NAME}
      limit 1
    `
    const activeRow = activeRows[0]

    return {
      status: 'blocked',
      jobName: MERCHANT_CATALOG_SYNC_JOB_NAME,
      leaseOwner: activeRow?.leaseOwner ?? 'unknown',
      acquiredAt: activeRow?.acquiredAt.toISOString() ?? null,
      expiresAt: activeRow?.expiresAt.toISOString() ?? null
    }
  } catch (error) {
    return {
      status: 'unavailable',
      jobName: MERCHANT_CATALOG_SYNC_JOB_NAME,
      leaseOwner,
      reason: error instanceof Error ? error.message : 'merchant_sync_lease_error'
    }
  }
}
