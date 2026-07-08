import { z } from 'zod'

import type { MicrosoftAdsOAuthConfig } from '@/lib/microsoft-ads/getMicrosoftAdsOAuthConfig'

const campaignApiBase = 'https://campaign.api.bingads.microsoft.com/CampaignManagement/v13'

const getUetTagAuthKeyResponseSchema = z
  .object({
    UetTagAuthKey: z.string().trim().min(1)
  })
  .strict()

export async function fetchMicrosoftUetTagAuthKey(
  config: MicrosoftAdsOAuthConfig,
  accessToken: string
): Promise<string> {
  const response = await fetch(`${campaignApiBase}/UetTagAuthKey/Query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      DeveloperToken: config.developerToken,
      CustomerId: config.customerId,
      CustomerAccountId: config.accountId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      UetTagId: Number(config.uetTagId)
    })
  })

  const responseText = await response.text()
  let parsedBody: unknown = {}

  try {
    parsedBody = responseText ? JSON.parse(responseText) : {}
  } catch {
    parsedBody = { raw: responseText.slice(0, 500) }
  }

  if (!response.ok) {
    throw new Error(
      `GetUetTagAuthKey failed with HTTP ${response.status}: ${responseText || response.statusText}`
    )
  }

  return getUetTagAuthKeyResponseSchema.parse(parsedBody).UetTagAuthKey
}
