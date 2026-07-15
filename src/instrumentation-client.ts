import * as Sentry from '@sentry/nextjs'
import {
  CHROME_EXTENSION_URL_PATTERN,
  isIgnorableClientError
} from '@/lib/observability/client/isIgnorableClientError'
import type { LogPayload } from 'types/observability/log/LogPayload'

/**
 * Client instrumentation — executes after the HTML document is loaded but
 * before React hydration begins. Next.js warns when this file takes longer
 * than 16ms, so everything here stays lightweight and is wrapped in
 * try/catch: a single instrumentation failure must never block hydration.
 *
 * Responsibilities:
 *  - Mark a client bootstrap baseline on the Performance timeline.
 *  - Capture uncaught errors and unhandled promise rejections, then beacon
 *    them to the first-party `/api/log` endpoint (production only).
 *  - Expose `onRouterTransitionStart` so client-side App Router navigations
 *    are marked for SPA-transition diagnostics.
 *
 * Optional analytics and replay are initialized elsewhere when enabled.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const SENTRY_DSN = process.env.NEXT_PUBLIC_PERFORMANCE_SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !!SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [],
  sendDefaultPii: false,
  enableLogs: true,
  tracesSampleRate: 0,
  denyUrls: [CHROME_EXTENSION_URL_PATTERN]
})

const MAX_REPORTED_ERRORS = 10
const reportedSignatures = new Set<string>()

function beaconError(event: string, data: Record<string, unknown>) {
  if (reportedSignatures.size >= MAX_REPORTED_ERRORS) return

  const signature = `${event}:${String(data.message ?? '')}:${String(data.source ?? '')}`
  if (reportedSignatures.has(signature)) return
  reportedSignatures.add(signature)

  const payload: LogPayload = {
    event,
    level: 'error',
    data,
    context: {
      pathname: window.location.pathname,
      href: window.location.href
    }
  }

  if (!IS_PRODUCTION) {
    console.error(`[instrumentation-client] ${event}`, payload)
    return
  }

  try {
    const body = JSON.stringify(payload)

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/log', new Blob([body], { type: 'application/json' }))
      return
    }

    void fetch('/api/log', {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'content-type': 'application/json' }
    }).catch(() => {})
  } catch {
    // Error reporting must never throw.
  }
}

try {
  performance.mark('app-init')

  window.addEventListener('error', event => {
    // #region agent log
    if (
      event.message.includes('cannot be a descendant') ||
      event.message.includes('Hydration failed')
    ) {
      fetch('http://127.0.0.1:7626/ingest/3d726327-2da6-4157-aa0a-bb33dbbbefd1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '4c1e91' },
        body: JSON.stringify({
          sessionId: '4c1e91',
          location: 'instrumentation-client.ts:error',
          message: 'hydration_or_nesting_error',
          data: {
            pathname: window.location.pathname,
            errorMessage: event.message,
            line: event.lineno
          },
          timestamp: Date.now(),
          hypothesisId: 'A'
        })
      }).catch(() => {})
    }
    // #endregion

    const stack = event.error instanceof Error ? event.error.stack : undefined
    if (
      isIgnorableClientError({
        message: event.message,
        source: event.filename,
        stack
      })
    ) return

    beaconError('client_error', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      stack
    })
  })

  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason
    beaconError('client_unhandled_rejection', {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined
    })
  })
} catch {
  // Instrumentation setup is best-effort and must never break the app.
}

/**
 * Invoked by Next.js when a client-side App Router navigation begins.
 * Adds a Performance mark so SPA transition timing is visible in dev tools
 * and Real User Monitoring, without emitting any runtime console noise.
 */
export function onRouterTransitionStart(url: string, navigationType: 'push' | 'replace' | 'traverse') {
  Sentry.captureRouterTransitionStart(url, navigationType)

  try {
    performance.mark(`nav-start:${navigationType}:${url}`)
  } catch {
    // Marking is best-effort.
  }
}
