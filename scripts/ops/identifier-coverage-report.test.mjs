import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildIdentifierCoverageReport,
  formatIdentifierCoverageReport
} from './identifier-coverage-report.mjs'

const thresholds = {
  maxHistoricalMissingGaClientIdRate: 0.25,
  maxHistoricalMissingPaidClickIdRate: 0.25,
  minCheckoutSnapshots: 1,
  maxReadyForProviderRepairOrders: 0,
  maxUnresolvedDeadLetters: 0,
  maxMicrosoftMissingCapiTokenPurchases: 0
}

function buildInput(overrides = {}) {
  return {
    orderCoverageRows: [
      {
        total_orders: 10,
        paid_orders: 9,
        total_revenue: '12000.50',
        first_processed_at: '2026-07-01T00:00:00.000Z',
        last_processed_at: '2026-07-08T00:00:00.000Z',
        ga_client_id: 4,
        ga_session_id: 4,
        fbp: 5,
        fbc: 3,
        meta_browser_ids: 5,
        google_click_id: 2,
        microsoft_click_id: 1,
        paid_click_id: 3
      }
    ],
    primaryGapRows: [
      {
        primary_attribution_gap: 'missing_ga_client_id',
        order_count: 6,
        revenue: '7000',
        ga_client_id: 0,
        meta_browser_ids: 2,
        google_click_id: 1,
        microsoft_click_id: 0,
        paid_click_id: 1,
        average_match_signal_count: '1.5'
      },
      {
        primary_attribution_gap: 'ready_for_provider_repair',
        order_count: 1,
        revenue: '900',
        ga_client_id: 1,
        meta_browser_ids: 1,
        google_click_id: 1,
        microsoft_click_id: 0,
        paid_click_id: 1,
        average_match_signal_count: '3'
      }
    ],
    checkoutSnapshotRows: [
      {
        total_snapshots: 0,
        first_captured_at: null,
        last_captured_at: null,
        ga_client_id: 0,
        ga_session_id: 0,
        fbp: 0,
        fbc: 0,
        external_id: 0,
        email_hash: 0,
        google_click_id: 0,
        microsoft_click_id: 0,
        paid_click_id: 0
      }
    ],
    providerPurchaseRows: [
      {
        provider: 'microsoft_uet',
        status: 'skipped_unqualified',
        dispatch_mode: 'server_direct',
        skip_reason: 'missing_capi_token',
        row_count: 1,
        latest_updated_at: '2026-07-08T00:00:00.000Z',
        latest_processed_at: '2026-07-08T00:00:00.000Z'
      }
    ],
    deadLetterRows: [
      {
        source: 'tracking:google',
        reason: 'Missing client_id for kristoffer@example.com',
        unresolved_count: 2,
        total_count: 2,
        latest_created_at: '2026-07-08T00:00:00.000Z',
        latest_resolved_at: null
      }
    ],
    ...overrides
  }
}

test('buildIdentifierCoverageReport summarizes coverage and alerts', () => {
  const report = buildIdentifierCoverageReport(buildInput(), {
    generatedAt: '2026-07-08T12:00:00.000Z',
    thresholds
  })

  assert.equal(report.mode, 'read-only')
  assert.equal(report.mutationPerformed, false)
  assert.equal(report.historicalShopify.coverage.totalOrders, 10)
  assert.equal(report.historicalShopify.coverage.signals.gaClientId.present, 4)
  assert.equal(report.historicalShopify.coverage.signals.gaClientId.missing, 6)
  assert.equal(report.checkoutSnapshots.coverage.totalSnapshots, 0)
  assert.deepEqual(
    report.alerts.map(alert => alert.code),
    [
      'checkout_attribution_snapshots_below_threshold',
      'historical_missing_ga_client_id_rate',
      'provider_repair_ready_orders_present',
      'unresolved_dead_letters_present',
      'microsoft_uet_purchase_missing_capi_token'
    ]
  )
})

test('buildIdentifierCoverageReport passes when all thresholds are satisfied', () => {
  const report = buildIdentifierCoverageReport(
    buildInput({
      orderCoverageRows: [
        {
          total_orders: 4,
          paid_orders: 4,
          total_revenue: '4000',
          first_processed_at: '2026-07-01T00:00:00.000Z',
          last_processed_at: '2026-07-08T00:00:00.000Z',
          ga_client_id: 4,
          ga_session_id: 4,
          fbp: 4,
          fbc: 4,
          meta_browser_ids: 4,
          google_click_id: 2,
          microsoft_click_id: 2,
          paid_click_id: 4
        }
      ],
      primaryGapRows: [],
      checkoutSnapshotRows: [
        {
          total_snapshots: 2,
          first_captured_at: '2026-07-08T00:00:00.000Z',
          last_captured_at: '2026-07-08T01:00:00.000Z',
          ga_client_id: 2,
          ga_session_id: 2,
          fbp: 2,
          fbc: 2,
          external_id: 2,
          email_hash: 0,
          google_click_id: 1,
          microsoft_click_id: 1,
          paid_click_id: 2
        }
      ],
      providerPurchaseRows: [],
      deadLetterRows: []
    }),
    {
      generatedAt: '2026-07-08T12:00:00.000Z',
      thresholds
    }
  )

  assert.deepEqual(report.alerts, [])
})

test('buildIdentifierCoverageReport downgrades stale Microsoft UET CAPI token rows', () => {
  const report = buildIdentifierCoverageReport(
    buildInput({
      providerPurchaseRows: [
        {
          provider: 'microsoft_uet',
          status: 'skipped_unqualified',
          dispatch_mode: 'server_direct',
          skip_reason: 'missing_attribution',
          row_count: 1,
          latest_updated_at: '2026-07-08T13:58:46.880Z',
          latest_processed_at: '2026-07-08T13:58:46.853Z'
        },
        {
          provider: 'microsoft_uet',
          status: 'skipped_unqualified',
          dispatch_mode: 'server_direct',
          skip_reason: 'missing_capi_token',
          row_count: 2,
          latest_updated_at: '2026-07-07T22:29:31.352Z',
          latest_processed_at: '2026-07-07T22:29:31.303Z'
        }
      ]
    }),
    {
      generatedAt: '2026-07-08T19:16:04.000Z',
      thresholds
    }
  )

  const microsoftAlert = report.alerts.find(alert =>
    alert.code.startsWith('microsoft_uet_purchase_missing_capi_token')
  )

  assert.equal(
    microsoftAlert?.code,
    'microsoft_uet_purchase_missing_capi_token_historical'
  )
  assert.equal(microsoftAlert?.severity, 'warning')
  assert.match(microsoftAlert?.message ?? '', /latest Microsoft UET purchase status is skipped_unqualified \| server_direct \| missing_attribution/)
})

test('formatIdentifierCoverageReport returns deterministic safe output', () => {
  const report = buildIdentifierCoverageReport(buildInput(), {
    generatedAt: '2026-07-08T12:00:00.000Z',
    thresholds
  })
  const formatted = formatIdentifierCoverageReport(report)

  assert.match(formatted, /Utekos identifier coverage and purchase readiness report/)
  assert.match(formatted, /Mode: read-only/)
  assert.match(formatted, /Mutation performed: no/)
  assert.match(formatted, /tracking:google \| Missing client_id for \[redacted-email\]/)
})
