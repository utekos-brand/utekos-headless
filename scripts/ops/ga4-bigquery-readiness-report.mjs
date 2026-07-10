#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { pathToFileURL } from 'node:url'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local', quiet: true })
dotenv.config({ path: '.env.mcp.local', override: false, quiet: true })

const execFileAsync = promisify(execFile)

const DEFAULT_PROJECT_ID = 'project-c683eb2c-20ae-4ec2-ac3'
const DEFAULT_DATASET_ID = 'analytics_489598217'
const DEFAULT_PROPERTY_ID = '489598217'

function getCliFlag(name, argv = process.argv.slice(2)) {
  return argv.includes(name)
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function toIsoFromBigQueryMillis(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null
  }

  return new Date(numericValue).toISOString()
}

function normalizeDataset(datasetJson) {
  if (!datasetJson || typeof datasetJson !== 'object') {
    return null
  }

  const datasetReference = datasetJson.datasetReference ?? {}

  return {
    id: normalizeText(datasetJson.id),
    projectId: normalizeText(datasetReference.projectId),
    datasetId: normalizeText(datasetReference.datasetId),
    location: normalizeText(datasetJson.location),
    creationTime: toIsoFromBigQueryMillis(datasetJson.creationTime),
    lastModifiedTime: toIsoFromBigQueryMillis(datasetJson.lastModifiedTime)
  }
}

function normalizeTables(tablesJson) {
  if (!Array.isArray(tablesJson)) {
    return []
  }

  return tablesJson
    .map(table => {
      const tableReference = table?.tableReference ?? {}
      const tableId = normalizeText(tableReference.tableId)

      return {
        tableId,
        type: normalizeText(table?.type, 'UNKNOWN'),
        creationTime: toIsoFromBigQueryMillis(table?.creationTime)
      }
    })
    .filter(table => table.tableId)
    .sort((a, b) => a.tableId.localeCompare(b.tableId))
}

function createAlert(severity, code, message, next) {
  return { severity, code, message, next }
}

function summarizeTables(tables) {
  const eventTables = tables.filter(table => /^events_\d{8}$/.test(table.tableId))
  const intradayTables = tables.filter(table => /^events_intraday_\d{8}$/.test(table.tableId))
  const latestEventTable = eventTables.at(-1)?.tableId ?? null
  const latestIntradayTable = intradayTables.at(-1)?.tableId ?? null

  return {
    totalTables: tables.length,
    eventTables: eventTables.length,
    intradayTables: intradayTables.length,
    latestEventTable,
    latestIntradayTable
  }
}

export function buildGa4BigQueryReadinessReport(input, options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const projectId = options.projectId ?? DEFAULT_PROJECT_ID
  const datasetId = options.datasetId ?? DEFAULT_DATASET_ID
  const propertyId = options.propertyId ?? DEFAULT_PROPERTY_ID
  const dataset = normalizeDataset(input.dataset)
  const tables = normalizeTables(input.tables)
  const tableSummary = summarizeTables(tables)
  const alerts = []

  if (!dataset) {
    alerts.push(createAlert(
      'critical',
      'ga4_bigquery_dataset_missing',
      `BigQuery dataset ${projectId}:${datasetId} does not exist or is not readable.`,
      'Wait for GA4 daily export to create the dataset, then rerun this report before creating Supabase BigQuery wrapper/read models.'
    ))
  } else if (tableSummary.eventTables === 0 && tableSummary.intradayTables === 0) {
    alerts.push(createAlert(
      'warning',
      'ga4_bigquery_events_tables_missing',
      `BigQuery dataset ${projectId}:${datasetId} exists, but no GA4 events_* or events_intraday_* tables were found.`,
      'Wait for the first GA4 export table before creating curated session, campaign, landing page or funnel models.'
    ))
  }

  return {
    generatedAt,
    mode: 'read-only',
    mutationPerformed: false,
    ok: alerts.length === 0,
    propertyId,
    projectId,
    datasetId,
    datasetExists: !!dataset,
    dataset,
    tableSummary,
    alerts
  }
}

export function formatGa4BigQueryReadinessReport(report) {
  const lines = [
    'Utekos GA4 BigQuery readiness report',
    `Generated at: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Mutation performed: ${report.mutationPerformed ? 'yes' : 'no'}`,
    '',
    'Target',
    `- GA4 property: ${report.propertyId}`,
    `- BigQuery dataset: ${report.projectId}:${report.datasetId}`,
    '',
    'Dataset',
    `- exists: ${report.datasetExists ? 'yes' : 'no'}`
  ]

  if (report.dataset) {
    lines.push(
      `- location: ${report.dataset.location || 'unknown'}`,
      `- created: ${report.dataset.creationTime || 'unknown'}`,
      `- modified: ${report.dataset.lastModifiedTime || 'unknown'}`
    )
  }

  lines.push(
    '',
    'Tables',
    `- total: ${report.tableSummary.totalTables}`,
    `- events_*: ${report.tableSummary.eventTables}`,
    `- events_intraday_*: ${report.tableSummary.intradayTables}`,
    `- latest events_*: ${report.tableSummary.latestEventTable ?? 'none'}`,
    `- latest events_intraday_*: ${report.tableSummary.latestIntradayTable ?? 'none'}`,
    '',
    'Alerts'
  )

  if (report.alerts.length === 0) {
    lines.push('- none')
  } else {
    report.alerts.forEach(alert => {
      lines.push(`- ${alert.severity.toUpperCase()} ${alert.code}: ${alert.message}`)
      lines.push(`  next: ${alert.next}`)
    })
  }

  return lines.join('\n')
}

async function runBqJson(args) {
  const { stdout } = await execFileAsync('bq', args, {
    maxBuffer: 1024 * 1024 * 10
  })

  return parseJson(stdout, null)
}

async function readBigQueryState({ projectId, datasetId }) {
  const target = `${projectId}:${datasetId}`

  try {
    const dataset = await runBqJson([
      '--project_id',
      projectId,
      'show',
      '--format=prettyjson',
      target
    ])
    const tables = await runBqJson([
      '--project_id',
      projectId,
      'ls',
      '--format=prettyjson',
      target
    ])

    return { dataset, tables }
  } catch (error) {
    return {
      dataset: null,
      tables: [],
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function main() {
  const projectId = normalizeText(process.env.GA4_BIGQUERY_PROJECT_ID, DEFAULT_PROJECT_ID)
  const datasetId = normalizeText(process.env.GA4_BIGQUERY_DATASET_ID, DEFAULT_DATASET_ID)
  const propertyId = normalizeText(process.env.GA4_PROPERTY_ID, DEFAULT_PROPERTY_ID)
  const state = await readBigQueryState({ projectId, datasetId })
  const report = buildGa4BigQueryReadinessReport(state, {
    projectId,
    datasetId,
    propertyId
  })

  console.log(formatGa4BigQueryReadinessReport(report))

  if (getCliFlag('--json')) {
    console.log(JSON.stringify(report, null, 2))
  }

  if (getCliFlag('--fail-on-alerts') && report.alerts.length > 0) {
    process.exitCode = 1
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
