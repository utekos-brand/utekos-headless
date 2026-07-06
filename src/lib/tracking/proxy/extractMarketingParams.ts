// Path: src/lib/tracking/proxy/extractMarketingParams.ts
import { MARKETING_CONFIG } from '@/api/constants/monitoring'
import { hashEmail } from '@/lib/tracking/hash/hashEmail'
import type { GoogleMarketingParams } from 'types/tracking/google/GoogleMarketingParams'

export function extractMarketingParams(
  searchParams: URLSearchParams
): GoogleMarketingParams {
  const timestamp = new Date().toISOString()
  const marketing: GoogleMarketingParams = {
    utm: {},
    fbclid: '',
    fbc: '',
    email: '',
    emailHash: '',
    additionalParams: {},
    all: {},
    timestamp
  }

  MARKETING_CONFIG.utm_params.forEach(param => {
    const value = searchParams.get(param)
    if (value) {
      marketing.utm[param] = value
      marketing.all[param] = value
    }
  })

  const fbclid = searchParams.get(MARKETING_CONFIG.fbclid_param)
  if (fbclid) {
    marketing.fbclid = fbclid
    marketing.all[MARKETING_CONFIG.fbclid_param] = fbclid
  }

  const fbc = searchParams.get(MARKETING_CONFIG.fbc_param)
  if (fbc) {
    marketing.fbc = fbc
    marketing.all[MARKETING_CONFIG.fbc_param] = fbc
  }

  const email = searchParams.get(MARKETING_CONFIG.email_param)
  if (email) {
    marketing.email = email
    marketing.emailHash = hashEmail(email)
    marketing.all.email_hash = marketing.emailHash
  }

  MARKETING_CONFIG.additional_params.forEach(param => {
    const value = searchParams.get(param)
    if (value) {
      marketing.additionalParams[param] = value
      marketing.all[param] = value
    }
  })

  return marketing
}
