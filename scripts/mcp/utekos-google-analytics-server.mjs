#!/usr/bin/env node

import process from 'node:process'

import { Client, StdioClientTransport } from '@modelcontextprotocol/client'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

const canonicalTools = [
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
const canonicalToolSet = new Set(canonicalTools)

const upstreamTransport = new StdioClientTransport({
  command: process.execPath,
  args: ['scripts/mcp/run-server.mjs', 'google-analytics'],
  cwd: process.cwd(),
  stderr: 'inherit'
})
const upstream = new Client({
  name: 'utekos-google-analytics-upstream-client',
  version: '1.0.0'
})

function toStructuredContent(result) {
  if (
    result.structuredContent &&
    typeof result.structuredContent === 'object' &&
    !Array.isArray(result.structuredContent)
  ) {
    return result.structuredContent
  }

  const text = result.content?.find(item => item.type === 'text')?.text
  if (!text) return { result: null }

  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
    return { items: Array.isArray(parsed) ? parsed : [parsed] }
  } catch {
    return { text }
  }
}

await upstream.connect(upstreamTransport)
const upstreamTools = (await upstream.listTools()).tools ?? []
const upstreamByName = new Map(upstreamTools.map(tool => [tool.name, tool]))
const missingTools = canonicalTools.filter(name => !upstreamByName.has(name))

if (missingTools.length > 0 || upstreamTools.length !== canonicalTools.length) {
  await upstream.close()
  throw new Error(
    `Official Google Analytics MCP tool drift: missing ${missingTools.join(', ') || '-'}; received ${upstreamTools.length} tools.`
  )
}

const server = new Server(
  {
    name: 'utekos-google-analytics-readonly',
    version: '1.0.0'
  },
  {
    capabilities: { tools: {} },
    instructions:
      'Read-only access to Utekos Google Analytics through the official Google Analytics MCP server. Never claim that these tools can mutate Analytics resources.'
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: canonicalTools.map(name => {
    const tool = upstreamByName.get(name)
    return {
      ...tool,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      outputSchema: {
        type: 'object',
        additionalProperties: true
      }
    }
  })
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args = {} } = request.params
  if (!canonicalToolSet.has(name)) {
    throw new Error(`Tool is not available on this read-only surface: ${name}`)
  }

  console.error(
    JSON.stringify({
      level: 'info',
      msg: 'utekos_google_analytics_tool_call',
      tool: name
    })
  )
  const result = await upstream.callTool(
    { name, arguments: args },
    undefined,
    { timeout: 120_000 }
  )

  return {
    content: result.content ?? [],
    structuredContent: toStructuredContent(result),
    isError: result.isError === true
  }
})

async function close() {
  await Promise.allSettled([server.close(), upstream.close()])
}

process.once('SIGINT', async () => {
  await close()
  process.exit(0)
})
process.once('SIGTERM', async () => {
  await close()
  process.exit(0)
})

await server.connect(new StdioServerTransport())
