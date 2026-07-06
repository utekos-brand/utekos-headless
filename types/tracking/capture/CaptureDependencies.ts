// Path: types/tracking/capture/CaptureDependencies.ts
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'

export type CaptureDependencies = {
  redisSet: (
    key: string,
    value: CheckoutAttribution,
    ttlSeconds: number
  ) => Promise<void>
  logger: (
    level: 'INFO' | 'ERROR',
    message: string,
    meta?: Record<string, unknown>,
    context?: Record<string, unknown>
  ) => Promise<void>
}
