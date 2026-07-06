import 'server-only'

import { BetaAnalyticsDataClient } from '@google-analytics/data'

import { getGoogleAnalyticsDataConfig } from './googleAnalyticsDataConfig'

let analyticsDataClient: BetaAnalyticsDataClient | null = null

export function getGoogleAnalyticsDataClient() {
  if (analyticsDataClient) {
    return analyticsDataClient
  }

  const config = getGoogleAnalyticsDataConfig()

  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.serviceAccount.clientEmail,
      private_key: config.serviceAccount.privateKey
    },
    ...(config.serviceAccount.projectId
      ? { projectId: config.serviceAccount.projectId }
      : {})
  })

  return analyticsDataClient
}
