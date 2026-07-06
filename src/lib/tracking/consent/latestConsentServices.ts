let latestConsentServices: Record<string, boolean> | null = null

export function setLatestConsentServices(services: Record<string, boolean>): void {
  latestConsentServices = services
}

export function getLatestConsentServices(): Record<string, boolean> | null {
  return latestConsentServices
}
