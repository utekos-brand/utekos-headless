import type { AdditionalMarketingParams } from 'types/tracking/google/AdditionalMarketingParams'

export function parseMarketingParamsCookie(
  cookieValue: string | undefined
): AdditionalMarketingParams {
  if (!cookieValue) {
    return {}
  }

  try {
    const parsed = JSON.parse(cookieValue) as {
      additionalParams?: Record<string, unknown>
    }
    const additionalParams = parsed.additionalParams ?? {}

    return {
      gclid:
        typeof additionalParams.gclid === 'string' ?
          additionalParams.gclid
        : undefined,
      gbraid:
        typeof additionalParams.gbraid === 'string' ?
          additionalParams.gbraid
        : undefined,
      wbraid:
        typeof additionalParams.wbraid === 'string' ?
          additionalParams.wbraid
        : undefined,
      msclkid:
        typeof additionalParams.msclkid === 'string' ?
          additionalParams.msclkid
        : undefined,
      dclid:
        typeof additionalParams.dclid === 'string' ?
          additionalParams.dclid
        : undefined
    }
  } catch {
    return {}
  }
}
