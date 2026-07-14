#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

import {
  Client,
  StdioClientTransport
} from '@modelcontextprotocol/client'

const expectedVersion = '0.6.0'
const expectedPropertyId = '489598217'
const expectedTools = [
  'get_account_summaries',
  'get_property_details',
  'list_google_ads_links',
  'list_property_annotations',
  'get_custom_dimensions_and_metrics',
  'run_report',
  'run_realtime_report',
  'run_funnel_report',
  'run_conversions_report'
]

function check(checks, name, ok, message) {
  checks.push({ name, ok, message })
}

function parseTextJson(result) {
  const text = result.content?.find(
    item => item.type === 'text'
  )?.text
  if (!text)
    throw new Error('MCP result did not contain text JSON')
  return JSON.parse(text)
}

function installedVersion() {
  const metadataPath = path.join(
    os.homedir(),
    '.local',
    'pipx',
    'venvs',
    'analytics-mcp',
    'pipx_metadata.json'
  )
  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(
        fs.readFileSync(metadataPath, 'utf8')
      )
      const version = metadata.main_package?.package_version
      if (typeof version === 'string') return version
    } catch {}
  }

  const result = spawnSync(
    'pipx',
    ['runpip', 'analytics-mcp', 'show', 'analytics-mcp'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  )
  if (result.status !== 0) return ''
  return (
    result.stdout.match(/^Version:\s*(.+)$/m)?.[1]?.trim() ?? ''
  )
}

async function main() {
  const checks = []
  const version = installedVersion()
  check(
    checks,
    'package:analytics-mcp',
    version === expectedVersion,
    version || 'not installed'
  )

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['scripts/mcp/run-server.mjs', 'google-analytics'],
    cwd: process.cwd(),
    stderr: 'inherit'
  })
  const client = new Client({
    name: 'utekos-google-analytics-mcp-doctor',
    version: '1.0.0'
  })

  try {
    await client.connect(transport)
    check(
      checks,
      'mcp:connect',
      true,
      'stdio handshake completed'
    )

    const listed = await client.listTools()
    const toolNames = (listed.tools ?? []).map(tool => tool.name)
    check(
      checks,
      'mcp:tool-count',
      toolNames.length === expectedTools.length,
      `${toolNames.length} tools`
    )
    for (const toolName of expectedTools) {
      check(
        checks,
        `mcp:tool:${toolName}`,
        toolNames.includes(toolName),
        toolNames.includes(toolName) ? 'available' : 'missing'
      )
    }

    const summariesResult = await client.callTool(
      { name: 'get_account_summaries', arguments: {} },
      undefined,
      { timeout: 120_000 }
    )
    const summaries = parseTextJson(summariesResult)
    const property = summaries
      .flatMap(account => account.property_summaries ?? [])
      .find(
        item =>
          item.property === `properties/${expectedPropertyId}`
      )
    check(
      checks,
      'live:account-summaries',
      summariesResult.isError !== true && Boolean(property),
      property?.display_name ??
        `property ${expectedPropertyId} missing`
    )

    const propertyResult = await client.callTool(
      {
        name: 'get_property_details',
        arguments: { property_id: expectedPropertyId }
      },
      undefined,
      { timeout: 120_000 }
    )
    const propertyDetails = parseTextJson(propertyResult)
    check(
      checks,
      'live:property-details',
      propertyResult.isError !== true &&
        propertyDetails.name ===
          `properties/${expectedPropertyId}`,
      propertyDetails.display_name ??
        propertyDetails.name ??
        'missing'
    )

    const reportResult = await client.callTool(
      {
        name: 'run_report',
        arguments: {
          property_id: expectedPropertyId,
          date_ranges: [
            { start_date: '7daysAgo', end_date: 'yesterday' }
          ],
          dimensions: ['eventName'],
          metrics: ['eventCount'],
          limit: 5
        }
      },
      undefined,
      { timeout: 120_000 }
    )
    const report = parseTextJson(reportResult)
    check(
      checks,
      'live:run-report',
      reportResult.isError !== true &&
        Array.isArray(report.rows) &&
        report.rows.length > 0,
      `${report.rows?.length ?? 0} rows; ${report.metadata?.time_zone ?? 'unknown timezone'}`
    )
  } finally {
    await client.close()
  }

  for (const item of checks) {
    console.log(
      `${item.ok ? 'PASS' : 'FAIL'} ${item.name.padEnd(42)} ${item.message}`
    )
  }
  const failures = checks.filter(item => !item.ok)
  if (failures.length > 0) {
    console.error(
      `mcp:google-analytics:doctor failed with ${failures.length} failure(s)`
    )
    process.exit(1)
  }
  console.log('mcp:google-analytics:doctor OK')
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.stack : String(error)
  )
  process.exit(1)
})
