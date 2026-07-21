import {
  runShopifyCommerceReconciliation,
  type RunShopifyCommerceReconciliationDependencies
} from '@/lib/analytics/server/runShopifyCommerceReconciliation'
import type { ShopifyCommerceReconciliationSummary } from '@/lib/analytics/server/shopifyCommerceReconciliationTypes'
import { hasValidCronAuthorization } from '@/lib/security/hasValidCronAuthorization'

export const maxDuration = 60

type RunReconciliation = (input: {
  runMode: 'accept'
}) => Promise<ShopifyCommerceReconciliationSummary>

export type ShopifyCommerceReconciliationCronDependencies = {
  getCronSecret: () => string | undefined
  runReconciliation: RunReconciliation
}

const defaultDependencies: ShopifyCommerceReconciliationCronDependencies =
  {
    getCronSecret: () => process.env.CRON_SECRET,
    runReconciliation: () =>
      runShopifyCommerceReconciliation({ runMode: 'accept' })
  }

function httpStatusForSummary(
  summary: ShopifyCommerceReconciliationSummary
) {
  if (
    summary.status === 'completed' ||
    summary.status === 'lease_blocked'
  ) {
    return 200
  }

  return 500
}

export async function handleShopifyCommerceReconciliationCron(
  request: Request,
  dependencies: ShopifyCommerceReconciliationCronDependencies = defaultDependencies
) {
  const authorized = hasValidCronAuthorization(
    request.headers.get('authorization'),
    dependencies.getCronSecret()
  )

  if (!authorized) {
    return Response.json(
      { ok: false },
      { headers: { 'Cache-Control': 'no-store' }, status: 401 }
    )
  }

  const summary = await dependencies.runReconciliation({
    runMode: 'accept'
  })

  return Response.json(summary, {
    headers: { 'Cache-Control': 'no-store' },
    status: httpStatusForSummary(summary)
  })
}

export function GET(request: Request) {
  return handleShopifyCommerceReconciliationCron(request)
}

export type { RunShopifyCommerceReconciliationDependencies }
