'use client'

/**
 * Consolidated first-party tracking client island.
 *
 * Combines ClickTracker (document-level click delegation) and
 * VisitorAnalyticsTracker (first-party visitor/session beacon) into
 * a single `'use client'` boundary. Two previously separate hydration
 * islands become one, reducing React island count and trimming the
 * main client chunk.
 *
 * Both children render null; they only attach effects.
 */

import { ClickTracker } from '@/components/analytics/ClickTracker'
import { VisitorAnalyticsTracker } from '@/components/analytics/VisitorAnalyticsTracker'

export function TrackingRoot() {
  return (
    <>
      <ClickTracker />
      <VisitorAnalyticsTracker />
    </>
  )
}
