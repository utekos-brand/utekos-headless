#!/usr/bin/env node

import process from 'node:process'

import {
  Client,
  StdioClientTransport
} from '@modelcontextprotocol/client'

const expectedTools = [
  'source_access_bootstrap',
  'source_file_inventory',
  'search_source_files',
  'read_source_files'
]

const expectedAllowedRoots = ['src', 'supabase']
const expectedAllowedFiles = [
  'next.config.mts',
  'package.json',
  'vercel.json',
  'global.d.ts'
]

function check(checks, name, ok, message) {
  checks.push({ name, ok, message })
}

function printChecks(checks) {
  for (const item of checks) {
    console.log(
      `${item.ok ? 'PASS' : 'FAIL'} ${item.name.padEnd(36)} ${item.message}`
    )
  }
}

async function main() {
  const checks = []
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['scripts/mcp/utekos-source-insight-server.mjs'],
    cwd: process.cwd()
  })
  const client = new Client({
    name: 'utekos-source-insight-doctor',
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
      check(
        checks,
        `tool:${toolName}`,
        Boolean(tool),
        tool ? 'available' : 'missing'
      )
      if (!tool) continue
      check(
        checks,
        `schema:${toolName}`,
        Boolean(tool.outputSchema),
        tool.outputSchema ?
          'outputSchema present'
        : 'missing outputSchema'
      )
      check(
        checks,
        `read_only:${toolName}`,
        tool.annotations?.readOnlyHint === true,
        String(tool.annotations?.readOnlyHint)
      )
      check(
        checks,
        `destructive:${toolName}`,
        tool.annotations?.destructiveHint === false,
        String(tool.annotations?.destructiveHint)
      )
      check(
        checks,
        `open_world:${toolName}`,
        tool.annotations?.openWorldHint === false,
        String(tool.annotations?.openWorldHint)
      )
    }

    const bootstrap = await client.callTool({
      name: 'source_access_bootstrap',
      arguments: {}
    })
    const permissions = bootstrap.structuredContent?.permissions
    check(
      checks,
      'bootstrap:allowed_roots',
      JSON.stringify(permissions?.allowed_roots) ===
        JSON.stringify(expectedAllowedRoots),
      JSON.stringify(permissions?.allowed_roots ?? [])
    )
    check(
      checks,
      'bootstrap:allowed_files',
      JSON.stringify(permissions?.allowed_files) ===
        JSON.stringify(expectedAllowedFiles),
      JSON.stringify(permissions?.allowed_files ?? [])
    )

    const inventory = await client.callTool({
      name: 'source_file_inventory',
      arguments: { paths: ['src', 'supabase'], limit: 5000 }
    })
    const inventoryPaths = new Set(
      (inventory.structuredContent?.data?.files ?? []).map(
        file => file.path
      )
    )
    check(
      checks,
      'inventory:src',
      [...inventoryPaths].some(file => file.startsWith('src/')),
      'src files visible'
    )
    check(
      checks,
      'inventory:supabase',
      [...inventoryPaths].some(file =>
        file.startsWith('supabase/')
      ),
      'supabase files visible'
    )
    check(
      checks,
      'inventory:secret_excluded',
      !inventoryPaths.has('supabase/md.md') &&
        ![...inventoryPaths].some(file =>
          file.includes('/.env')
        ),
      'denied files absent'
    )

    const rootInventory = await client.callTool({
      name: 'source_file_inventory',
      arguments: { paths: expectedAllowedFiles, limit: 20 }
    })
    const rootPaths = new Set(
      (rootInventory.structuredContent?.data?.files ?? []).map(
        file => file.path
      )
    )
    for (const file of expectedAllowedFiles) {
      check(
        checks,
        `inventory:${file}`,
        rootPaths.has(file),
        rootPaths.has(file) ? 'present' : 'missing'
      )
    }

    const search = await client.callTool({
      name: 'search_source_files',
      arguments: {
        query: 'scripts',
        paths: ['package.json'],
        limit: 10
      }
    })
    check(
      checks,
      'call:search_source_files',
      (search.structuredContent?.data?.matches?.length ?? 0) > 0,
      `${search.structuredContent?.data?.matches?.length ?? 0} matches`
    )

    const read = await client.callTool({
      name: 'read_source_files',
      arguments: {
        paths: [
          'next.config.mts',
          'package.json',
          'vercel.json',
          'global.d.ts'
        ],
        max_bytes_per_file: 5000
      }
    })
    check(
      checks,
      'call:read_source_files',
      read.structuredContent?.data?.files?.length === 4,
      `${read.structuredContent?.data?.files?.length ?? 0} files`
    )

    for (const deniedPath of [
      '.env.tunnel.local',
      'AGENTS.md',
      'supabase/md.md',
      '../package.json',
      'src/api/lib/cloud-credentials/example.json'
    ]) {
      const denied = await client.callTool({
        name: 'read_source_files',
        arguments: {
          paths: [deniedPath],
          max_bytes_per_file: 1000
        }
      })
      check(
        checks,
        `policy:denied:${deniedPath}`,
        denied.structuredContent?.ok === false,
        denied.structuredContent?.ok === false ?
          'denied'
        : 'not denied'
      )
    }

    printChecks(checks)
  } finally {
    await client.close()
  }

  const failed = checks.filter(item => !item.ok)
  if (failed.length > 0) {
    console.error(
      `mcp:source-insight:doctor failed with ${failed.length} failure(s)`
    )
    process.exit(1)
  }

  console.log('mcp:source-insight:doctor OK')
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.stack : String(error)
  )
  process.exit(1)
})
