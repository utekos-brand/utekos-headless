export type MerchantCatalogSyncLease =
  | {
      status: 'acquired'
      jobName: string
      leaseOwner: string
      acquiredAt: string
      expiresAt: string
    }
  | {
      status: 'blocked'
      jobName: string
      leaseOwner: string
      acquiredAt: string | null
      expiresAt: string | null
    }
  | {
      status: 'unavailable'
      jobName: string
      leaseOwner: string
      reason: string
    }
