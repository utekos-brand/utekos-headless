import 'server-only'

import postgres from 'postgres'

let trackingWarehouse: ReturnType<typeof postgres> | null | undefined

function getTrackingWarehouseUrl(): string | undefined {
  return (
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING
    || process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING_MAYBE
    || process.env.SUPABASE_VERCEL_POSTGRES_URL
  )
}

export function getTrackingWarehouse(): ReturnType<typeof postgres> | null {
  if (trackingWarehouse !== undefined) {
    return trackingWarehouse
  }

  const connectionUrl = getTrackingWarehouseUrl()

  if (!connectionUrl) {
    trackingWarehouse = null
    return trackingWarehouse
  }

  trackingWarehouse = postgres(connectionUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    connection: {
      application_name: 'utekos-tracking'
    }
  })

  return trackingWarehouse
}
