import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'

export function findMicrosoftClickId(
  clickId: CanonicalEventEnvelope['click_id']
): string | undefined {
  const candidate = clickId?.msclkid?.trim()
  return candidate ? candidate : undefined
}
