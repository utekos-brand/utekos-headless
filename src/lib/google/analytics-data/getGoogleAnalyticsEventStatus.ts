import 'server-only'

import { z } from 'zod'

import { getGoogleAnalyticsDataClient } from './getGoogleAnalyticsDataClient'
import { getGoogleAnalyticsDataConfig } from './googleAnalyticsDataConfig'

const expectedCommerceEvents = [
  'page_view',
  'view_item_list',
  'select_item',
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'purchase',
  'search',
  'generate_lead'
]

const analyticsReportRowSchema = z.object({
  dimensionValues: z
    .array(
      z.object({
        value: z.string().optional()
      })
    )
    .optional(),
  metricValues: z
    .array(
      z.object({
        value: z.string().optional()
      })
    )
    .optional()
})

function mapEventCounts(rows: unknown[] | null | undefined) {
  const counts = new Map<string, number>()
  const parsedRows = analyticsReportRowSchema.array().parse(rows ?? [])

  for (const row of parsedRows) {
    const eventName = row.dimensionValues?.[0]?.value
    const eventCount = Number(row.metricValues?.[0]?.value ?? 0)

    if (eventName && Number.isFinite(eventCount)) {
      counts.set(eventName, eventCount)
    }
  }

  return Object.fromEntries(counts.entries())
}

function mapExpectedEventCoverage(counts: Record<string, number>) {
  return expectedCommerceEvents.map(eventName => ({
    eventName,
    eventCount: counts[eventName] ?? 0,
    observed: (counts[eventName] ?? 0) > 0
  }))
}

export async function getGoogleAnalyticsEventStatus() {
  const config = getGoogleAnalyticsDataConfig()
  const client = getGoogleAnalyticsDataClient()
  const [realtimeReport] = await client.runRealtimeReport({
    property: config.propertyName,
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }]
  })
  const [dailyReport] = await client.runReport({
    property: config.propertyName,
    dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }]
  })
  const realtimeCounts = mapEventCounts(realtimeReport.rows)
  const dailyCounts = mapEventCounts(dailyReport.rows)

  return {
    checkedAt: new Date().toISOString(),
    propertyId: config.propertyId,
    realtime: {
      counts: realtimeCounts,
      expectedEvents: mapExpectedEventCoverage(realtimeCounts)
    },
    last24Hours: {
      counts: dailyCounts,
      expectedEvents: mapExpectedEventCoverage(dailyCounts)
    }
  }
}
