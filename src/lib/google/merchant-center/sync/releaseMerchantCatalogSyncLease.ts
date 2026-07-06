import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'

import type { MerchantCatalogSyncLease } from './MerchantCatalogSyncLease'

export async function releaseMerchantCatalogSyncLease(
  lease: MerchantCatalogSyncLease
): Promise<void> {
  if (lease.status !== 'acquired') {
    return
  }

  const sql = getTrackingWarehouse()

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
