// Path: src/components/analytics/MetaPixel/generateEventID.ts

export function generateEventID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `evt_${Date.now()}_${crypto.randomUUID()}`
  }

  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}
