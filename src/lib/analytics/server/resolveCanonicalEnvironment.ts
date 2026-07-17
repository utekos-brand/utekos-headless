import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'

export function resolveCanonicalEnvironment(): CanonicalEventEnvelope['environment'] {
  const nodeEnvironment = process.env.NODE_ENV

  if (nodeEnvironment === 'test') return 'test'
  if (nodeEnvironment === 'production') return 'production'

  return 'development'
}
