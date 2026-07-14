type ClarityConsent = {
  source?: string
  ad_Storage: 'granted' | 'denied'
  analytics_Storage: 'granted' | 'denied'
}

type QueuedClarity = NonNullable<Window['clarity']> & {
  q: unknown[][]
}

export function queueClarityConsent(consent: ClarityConsent): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.clarity) {
    const queuedClarity = ((...args: unknown[]) => {
      queuedClarity.q.push(args)
    }) as QueuedClarity
    queuedClarity.q = []
    window.clarity = queuedClarity
  }

  window.clarity('consentv2', consent)
}
