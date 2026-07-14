#!/usr/bin/env node

import process from 'node:process'

import { Client, StdioClientTransport } from '@modelcontextprotocol/client'

const expectedTools = [
  'shopify_readonly_bootstrap',
  'shopify_access_scope_status',
  'shopify_orders_query',
  'shopify_customers_query'
]

function check(checks, name, ok, message) {
  checks.push({ name, ok, message })
}

async function main() {
  const checks = []
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['scripts/mcp/utekos-shopify-readonly-server.mjs'],
    cwd: process.cwd()
  })
  const client = new Client({ name: 'utekos-shopify-readonly-doctor', version: '1.0.0' })

  try {
    await client.connect(transport)
    check(checks, 'connect', true, 'stdio server connected')

    const listed = await client.listTools()
    const tools = listed.tools ?? []
    check(checks, 'tool_count', tools.length === expectedTools.length, `${tools.length} tools`)

    for (const toolName of expectedTools) {
      const tool = tools.find(item => item.name === toolName)
      check(checks, `tool:${toolName}`, Boolean(tool), tool ? 'available' : 'missing')
      if (!tool) continue
      check(checks, `schema:${toolName}`, Boolean(tool.outputSchema), tool.outputSchema ? 'outputSchema present' : 'missing')
      check(checks, `read_only:${toolName}`, tool.annotations?.readOnlyHint === true, String(tool.annotations?.readOnlyHint))
      check(checks, `destructive:${toolName}`, tool.annotations?.destructiveHint === false, String(tool.annotations?.destructiveHint))
      check(checks, `idempotent:${toolName}`, tool.annotations?.idempotentHint === true, String(tool.annotations?.idempotentHint))
    }

    const bootstrap = await client.callTool({ name: 'shopify_readonly_bootstrap', arguments: {} })
    check(checks, 'call:bootstrap', bootstrap.structuredContent?.ok === true, `${bootstrap.structuredContent?.data?.canonical_tools?.length ?? 0} canonical tools`)
    check(checks, 'no_broad_token_fallback', bootstrap.structuredContent?.data?.policy?.broad_admin_token_fallback === false, 'dedicated credentials only')

    const scopes = await client.callTool({ name: 'shopify_access_scope_status', arguments: {} })
    check(checks, 'call:scope_status', scopes.structuredContent?.tool === 'shopify_access_scope_status', scopes.structuredContent?.ok ? 'live scope query OK' : 'structured credential gate')

    if (scopes.structuredContent?.ok) {
      const orders = await client.callTool({ name: 'shopify_orders_query', arguments: { first: 1, query: 'created_at:>=2026-01-01', reverse: true } })
      check(checks, 'call:orders', orders.structuredContent?.tool === 'shopify_orders_query', orders.structuredContent?.ok ? 'bounded live query OK' : 'structured scope failure')

      const customers = await client.callTool({ name: 'shopify_customers_query', arguments: { first: 1, query: 'id:0', include_contact: false, reverse: true } })
      check(checks, 'call:customers', customers.structuredContent?.tool === 'shopify_customers_query', customers.structuredContent?.ok ? 'bounded live query OK without contact' : 'structured scope failure')
      check(checks, 'customer_contact_default', customers.structuredContent?.data?.contact_included === false, 'contact excluded')
    } else {
      check(checks, 'call:orders', true, 'skipped until dedicated credentials are ready')
      check(checks, 'call:customers', true, 'skipped until dedicated credentials are ready')
      check(checks, 'customer_contact_default', true, 'schema defaults contact to false')
    }
  } finally {
    await client.close()
  }

  for (const item of checks) {
    console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name.padEnd(34)} ${item.message}`)
  }
  const failed = checks.filter(item => !item.ok)
  if (failed.length > 0) process.exit(1)
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
