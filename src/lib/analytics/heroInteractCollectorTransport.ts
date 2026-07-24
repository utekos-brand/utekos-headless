import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalHeroInteract } from './heroInteractEvent'

export const startHeroInteractCollectorTransport =
  createCanonicalCollectorTransport<CanonicalHeroInteract>({
    analyticsEventName: 'hero_interact',
    endpoint: '/api/events/hero-interact'
  })
