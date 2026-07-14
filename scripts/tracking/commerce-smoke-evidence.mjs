const microsoftActionByCanonicalEvent = {
  begin_checkout: 'AutoEvent_begin_checkout'
}

export function networkEvidenceFromUrl(url) {
  try {
    const parsedUrl = new URL(url)
    const host = parsedUrl.hostname
    const path = parsedUrl.pathname
    const eventId = parsedUrl.searchParams.get('event_id') || parsedUrl.searchParams.get('eid')

    if (host === 'www.facebook.com' && path === '/tr/') {
      return {
        provider: 'meta',
        event: parsedUrl.searchParams.get('ev'),
        eventId,
        host,
        path
      }
    }

    if (host === 'bat.bing.com') {
      return {
        provider: 'microsoft_uet',
        event: parsedUrl.searchParams.get('en') || parsedUrl.searchParams.get('evt'),
        eventId,
        host,
        path
      }
    }

    if (host.includes('clarity.ms') || host.includes('clarity.microsoft.com')) {
      return { provider: 'clarity', event: null, eventId: null, host, path }
    }

    if (host === 'portal.utekos.no' || host.includes('posthog.com')) {
      return { provider: 'posthog', event: null, eventId: null, host, path }
    }
  } catch {
    return null
  }

  return null
}

export function assertCorrelatedProviderEvidence(
  payloads,
  networkEvidence,
  requiredEvents
) {
  const failures = []

  for (const expected of requiredEvents) {
    const payload = payloads[expected.canonicalEventName]
    const eventId = payload?.eventId

    const metaMatches = networkEvidence.meta.filter(evidence =>
      evidence.eventId === eventId && evidence.event === expected.eventName
    )
    if (metaMatches.length === 0) {
      failures.push(`Missing correlated Meta ${expected.eventName} evidence for ${eventId || 'unknown event id'}.`)
    }

    const microsoftAction = microsoftActionByCanonicalEvent[expected.canonicalEventName]
      || expected.canonicalEventName
    const microsoftMatches = networkEvidence.microsoft_uet.filter(evidence =>
      evidence.eventId === eventId && evidence.event === microsoftAction
    )
    if (microsoftMatches.length !== 1) {
      failures.push(
        `Expected exactly one Microsoft UET ${microsoftAction} event for ${eventId || 'unknown event id'}; observed ${microsoftMatches.length}.`
      )
    }
  }

  return failures
}
