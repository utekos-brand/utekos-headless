#!/usr/bin/env node

import process from 'node:process'

import { Client, StdioClientTransport } from '@modelcontextprotocol/client'

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

async function main() {
  const checks = []
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['scripts/mcp/utekos-google-analytics-server.mjs'],
    cwd: process.cwd(),
    stderr: 'inherit'
  })
  const client = new Client({
    name: 'utekos-google-analytics-chatgpt-doctor',
    version: '1.0.0'
  })

  try {
    await client.connect(transport)
    check(checks, 'connect', true, 'stdio server connected')

    const listed = await client.listTools()
    const tools = listed.tools ?? []
    check(
      checks,
      'tool_count',
      tools.length === expectedTools.length,
      `${tools.length} tools`
    )

    for (const toolName of expectedTools) {
      const tool = tools.find(item => item.name === toolName)
      check(checks, `tool:${toolName}`, Boolean(tool), tool ? 'available' : 'missing')
      if (!tool) continue
      check(checks, `schema:${toolName}`, Boolean(tool.outputSchema), 'outputSchema present')
      check(checks, `read_only:${toolName}`, tool.annotations?.readOnlyHint === true, String(tool.annotations?.readOnlyHint))
      check(checks, `destructive:${toolName}`, tool.annotations?.destructiveHint === false, String(tool.annotations?.destructiveHint))
      check(checks, `idempotent:${toolName}`, tool.annotations?.idempotentHint === true, String(tool.annotations?.idempotentHint))
      check(checks, `open_world:${toolName}`, tool.annotations?.openWorldHint === true, String(tool.annotations?.openWorldHint))
    }

    const summaries = await client.callTool(
      { name: 'get_account_summaries', arguments: {} },
      undefined,
      { timeout: 120_000 }
    )
    const accounts = summaries.structuredContent?.items ?? []
    const property = accounts
      .flatMap(account => account.property_summaries ?? [])
      .find(item => item.property === `properties/${expectedPropertyId}`)
    check(
      checks,
      'live:account_summaries',
      summaries.isError !== true && Boolean(property),
      property?.display_name ?? `property ${expectedPropertyId} missing`
    )

    const details = await client.callTool(
      {
        name: 'get_property_details',
        arguments: { property_id: expectedPropertyId }
      },
      undefined,
      { timeout: 120_000 }
    )
    check(
      checks,
      'live:property_details',
      details.isError !== true && details.structuredContent?.name === `properties/${expectedPropertyId}`,
      details.structuredContent?.display_name ?? details.structuredContent?.name ?? 'missing'
    )

    const report = await client.callTool(
      {
        name: 'run_report',
        arguments: {
          property_id: expectedPropertyId,
          date_ranges: [{ start_date: '7daysAgo', end_date: 'yesterday' }],
          dimensions: ['eventName'],
          metrics: ['eventCount'],
          limit: 5
        }
      },
      undefined,
      { timeout: 120_000 }
    )
    check(
      checks,
      'live:run_report',
      report.isError !== true && Array.isArray(report.structuredContent?.rows) && report.structuredContent.rows.length > 0,
      `${report.structuredContent?.rows?.length ?? 0} rows; ${report.structuredContent?.metadata?.time_zone ?? 'unknown timezone'}`
    )
  } finally {
    await client.close()
  }

  for (const item of checks) {
    console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name.padEnd(45)} ${item.message}`)
  }
  const failed = checks.filter(item => !item.ok)
  if (failed.length > 0) process.exit(1)
  console.log('mcp:google-analytics:chatgpt:doctor OK')
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
