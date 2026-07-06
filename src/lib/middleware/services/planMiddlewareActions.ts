import { generateCookieConfig } from '@/lib/middleware/services/generateCookieConfig'
import type {
  DetectedAdInteraction,
  MiddlewareCookieConfig,
  MiddlewareActionPlan
} from '@types'

export function planMiddlewareActions(
  interactions: DetectedAdInteraction[],
  isProduction: boolean
): MiddlewareActionPlan {
  const cookiesToSet: MiddlewareCookieConfig[] = []
  const logsToDispatch: DetectedAdInteraction['logData'][] = []

  for (const interaction of interactions) {
    // 1. Planlegg Cookie (hvis aktuelt)
    if (interaction.cookieName) {
      const config = generateCookieConfig(
        interaction.cookieName,
        interaction.paramValue,
        isProduction
      )
      cookiesToSet.push(config)
    }

    // 2. Planlegg Logging
    logsToDispatch.push(interaction.logData)
  }

  return { cookiesToSet, logsToDispatch }
}
