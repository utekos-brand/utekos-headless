import { getMissingRequiredUsercentricsServices } from './getMissingRequiredUsercentricsServices'

let lastReportedSignature = ''

export function reportMissingRequiredUsercentricsServices(services: Record<string, boolean>): void {
  const missingServices = getMissingRequiredUsercentricsServices(services)
  const signature = missingServices.join('|')

  if (!signature || signature === lastReportedSignature) {
    return
  }

  lastReportedSignature = signature
  const storageKey = `utekos:usercentrics-missing-services:${signature}`

  try {
    if (window.localStorage.getItem(storageKey)) {
      return
    }

    window.localStorage.setItem(storageKey, new Date().toISOString())
  } catch {
    // Continue with one in-memory report when browser storage is unavailable.
  }

  console.error('[Tracking configuration] Required Usercentrics services are missing:', missingServices)

  void fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'usercentrics_required_services_missing',
      level: 'error',
      data: {
        missingServices
      }
    }),
    keepalive: true
  }).catch(error => {
    console.error('[Tracking configuration] Failed to report missing Usercentrics services:', error)
  })
}
