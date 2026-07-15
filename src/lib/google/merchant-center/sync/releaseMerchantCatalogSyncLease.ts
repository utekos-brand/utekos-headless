import 'server-only'

import { getPostgresClient } from '@/lib/db/getPostgresClient'

import type { MerchantCatalogSyncLease } from './MerchantCatalogSyncLease'

export async function releaseMerchantCatalogSyncLease(
  lease: MerchantCatalogSyncLease
): Promise<void> {
  if (lease.status !== 'acquired') {
    return
  }

  const sql = getPostgresClient()

  if (!sql) {
    return
  }

  try {
    await sql`
      update ops.integration_job_leases
      set
        expires_at = now(),
        updated_at = now(),
        metadata = metadata || ${sql.json({
          releasedAt: new Date().toISOString()
        })}
      where
        job_name = ${lease.jobName}
        and lease_owner = ${lease.leaseOwner}
    `
  } catch (error) {
    console.error('[Merchant Center] Failed to release catalog sync lease', error)
  }
}
