// Path: src/lib/middleware/config/ad-platforms.ts

import type { AdPlatformConfig } from '@types'

export const AD_PLATFORMS: AdPlatformConfig[] = [
  {
    id: 'meta',
    param: 'fbclid',
    cookieName: undefined,
    logConfig: {
      eventName: 'Meta Ad Click Detected',
      emoji: '💙'
    }
  }
]
