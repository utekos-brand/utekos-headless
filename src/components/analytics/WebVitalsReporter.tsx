'use client'

import { useReportWebVitals } from 'next/web-vitals'

type MetricPayload =
  Parameters<typeof useReportWebVitals>[0] extends (
    (metric: infer Metric) => void
  ) ?
    Metric
  : never

function reportWebVitals(metric: MetricPayload) {
  const payload = {
    type: 'web-vital',
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    attribution: 'attribution' in metric ? metric.attribution : undefined,
    entries: metric.entries,
    pathname:
      typeof window !== 'undefined' ? window.location.pathname : undefined,
    href: typeof window !== 'undefined' ? window.location.href : undefined,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    timestamp: Date.now()
  }

  const body = JSON.stringify(payload)

  if (process.env.NODE_ENV !== 'production') {
    console.info('[web-vitals]', payload)
    return
  }

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body)
    return
  }

  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body,
    keepalive: true,
    headers: {
      'content-type': 'application/json'
    }
  }).catch(() => {})
}

export function WebVitalsReporter() {
  useReportWebVitals(reportWebVitals)
  return null
}
