import { AD_PLATFORMS } from '@/lib/middleware/config/ad-platforms'
import type { DetectedAdInteraction } from '@types'

export function detectAdInteractions(
  searchParams: URLSearchParams
): DetectedAdInteraction[] {
  const interactions: DetectedAdInteraction[] = []

  for (const config of AD_PLATFORMS) {
    const value = searchParams.get(config.param)

    if (value) {
      interactions.push({
        platformId: config.id,
        paramValue: value,
        cookieName: config.cookieName, 
        logData: {
          level: 'INFO',
          event: config.logConfig.eventName,
          context: {
            [config.param]: value, 
            source: 'proxy-middleware'
          }
        }
      })
    }
  }

  return interactions
}
