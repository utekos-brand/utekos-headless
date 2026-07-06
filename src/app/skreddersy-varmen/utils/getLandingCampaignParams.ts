// Path: src/app/skreddersy-varmen/utils/getLandingCampaignParams.ts

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

export type LandingCampaignParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  /** Meta ad-id forwarded via ad URL parameters (e.g. {{ad.id}}). */
  ad_id?: string
  /** Meta adset-id forwarded via ad URL parameters (e.g. {{adset.id}}). */
  adset_id?: string
  /** Meta campaign-id forwarded via ad URL parameters (e.g. {{campaign.id}}). */
  campaign_id?: string
}

/**
 * Leser kampanje-parametre fra nåværende URL. Brukes til å berike
 * landing-ViewContent og persistere attribusjon. Deterministisk og
 * trygt å kalle gjentatte ganger.
 */
export function getLandingCampaignParams(
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): LandingCampaignParams {
  const params = new URLSearchParams(search)
  const result: LandingCampaignParams = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) {
      result[key] = value
    }
  }

  const fbclid = params.get('fbclid')
  if (fbclid) result.fbclid = fbclid

  const adId = params.get('ad_id')
  if (adId) result.ad_id = adId

  const adsetId = params.get('adset_id')
  if (adsetId) result.adset_id = adsetId

  const campaignId = params.get('campaign_id')
  if (campaignId) result.campaign_id = campaignId

  return result
}

export function hasLandingCampaignParams(params: LandingCampaignParams): boolean {
  return Object.keys(params).length > 0
}
