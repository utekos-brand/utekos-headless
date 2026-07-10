import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildGa4BigQueryReadinessReport,
  formatGa4BigQueryReadinessReport
} from './ga4-bigquery-readiness-report.mjs'

test('reports missing GA4 BigQuery dataset as a read-only critical gate', () => {
  const report = buildGa4BigQueryReadinessReport(
    { dataset: null, tables: [] },
    {
      generatedAt: '2026-07-08T20:50:00.000Z',
      projectId: 'project-c683eb2c-20ae-4ec2-ac3',
      datasetId: 'analytics_489598217',
      propertyId: '489598217'
    }
  )

  assert.equal(report.mode, 'read-only')
  assert.equal(report.mutationPerformed, false)
  assert.equal(report.ok, false)
  assert.equal(report.datasetExists, false)
  assert.deepEqual(
    report.alerts.map(alert => alert.code),
    ['ga4_bigquery_dataset_missing']
  )
})

test('passes when GA4 BigQuery dataset has daily events table', () => {
  const report = buildGa4BigQueryReadinessReport(
    {
      dataset: {
        id: 'project-c683eb2c-20ae-4ec2-ac3:analytics_489598217',
        datasetReference: {
          projectId: 'project-c683eb2c-20ae-4ec2-ac3',
          datasetId: 'analytics_489598217'
        },
        location: 'EU',
        creationTime: '1783540000000',
        lastModifiedTime: '1783543600000'
      },
      tables: [
        {
          tableReference: { tableId: 'events_20260708' },
          type: 'TABLE',
          creationTime: '1783543600000'
        }
      ]
    },
    {
      generatedAt: '2026-07-08T20:50:00.000Z'
    }
  )

  assert.equal(report.ok, true)
  assert.equal(report.datasetExists, true)
  assert.equal(report.dataset?.location, 'EU')
  assert.equal(report.tableSummary.eventTables, 1)
  assert.equal(report.tableSummary.latestEventTable, 'events_20260708')
  assert.deepEqual(report.alerts, [])
})

test('warns when dataset exists without GA4 event tables', () => {
  const report = buildGa4BigQueryReadinessReport(
    {
      dataset: {
        datasetReference: {
          projectId: 'project-c683eb2c-20ae-4ec2-ac3',
          datasetId: 'analytics_489598217'
        },
        location: 'EU'
      },
      tables: [{ tableReference: { tableId: 'not_ga4' }, type: 'TABLE' }]
    },
    {
      generatedAt: '2026-07-08T20:50:00.000Z'
    }
  )

  assert.equal(report.ok, false)
  assert.equal(report.datasetExists, true)
  assert.equal(report.tableSummary.totalTables, 1)
  assert.deepEqual(
    report.alerts.map(alert => alert.code),
    ['ga4_bigquery_events_tables_missing']
  )
})

test('formats deterministic readiness output', () => {
  const report = buildGa4BigQueryReadinessReport(
    { dataset: null, tables: [] },
    {
      generatedAt: '2026-07-08T20:50:00.000Z',
      projectId: 'project-c683eb2c-20ae-4ec2-ac3',
      datasetId: 'analytics_489598217',
      propertyId: '489598217'
    }
  )
  const output = formatGa4BigQueryReadinessReport(report)

  assert.match(output, /Utekos GA4 BigQuery readiness report/)
  assert.match(output, /Mutation performed: no/)
  assert.match(output, /CRITICAL ga4_bigquery_dataset_missing/)
})
