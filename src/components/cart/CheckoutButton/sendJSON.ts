export function sendJSON(url: string, data: unknown): void {
  try {
    const payload = JSON.stringify(data)
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const ok = navigator.sendBeacon(
        url,
        new Blob([payload], { type: 'application/json' })
      )
      if (ok) return
      console.warn(
        `navigator.sendBeacon to ${url} failed, falling back to fetch.`
      )
    }
    void fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true
    })
  } catch (error) {
    console.error(`Failed to send analytics data to ${url}:`, error)
    // stille fail – må aldri blokkere checkout
  }
}
