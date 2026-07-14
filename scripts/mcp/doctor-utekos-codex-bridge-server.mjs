#!/usr/bin/env node

import process from 'node:process'
import path from 'node:path'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

import {
  Client,
  StdioClientTransport
} from '@modelcontextprotocol/client'

const expectedTools = [
  'codex_bridge_bootstrap',
  'ask_utekos_codex',
  'implement_utekos_change',
  'continue_utekos_codex',
  'get_utekos_codex_result',
  'codex_bridge_status'
]

async function waitForCompletedJob(
  client,
  initial,
  timeoutMs = 16 * 60 * 1000
) {
  const jobId = initial.structuredContent?.data?.job_id
  if (!jobId) return initial
  const deadline = Date.now() + timeoutMs
  let current = initial
  while (
    ['queued', 'running'].includes(
      current.structuredContent?.data?.status
    ) &&
    Date.now() < deadline
  ) {
    current = await client.callTool(
      {
        name: 'get_utekos_codex_result',
        arguments: { job_id: jobId, wait_ms: 15_000 }
      },
      undefined,
      { timeout: 25_000 }
    )
  }
  return current
}

function check(checks, name, ok, message) {
  checks.push({ name, ok, message })
}

function printChecks(checks) {
  for (const item of checks) {
    console.log(
      `${item.ok ? 'PASS' : 'FAIL'} ${item.name.padEnd(42)} ${item.message}`
    )
  }
}

async function main() {
  const live = process.argv.includes('--live')
  const liveWrite = process.argv.includes('--live-write')
  const checks = []
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['scripts/mcp/utekos-codex-bridge-server.mjs'],
    cwd: process.cwd(),
    stderr: 'inherit'
  })
  const client = new Client({
    name: 'utekos-codex-bridge-doctor',
    version: '1.0.0'
  })

  try {
    await client.connect(transport)
    check(checks, 'connect', true, 'stdio bridge connected')

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
        tool.annotations?.readOnlyHint ===
          (toolName !== 'implement_utekos_change'),
        String(tool.annotations?.readOnlyHint)
      )
      check(
        checks,
        `destructive:${toolName}`,
        tool.annotations?.destructiveHint === false,
        String(tool.annotations?.destructiveHint)
      )
    }

    const bootstrap = await client.callTool(
      { name: 'codex_bridge_bootstrap', arguments: {} },
      undefined,
      { timeout: 60_000 }
    )
    check(
      checks,
      'call:codex_bridge_bootstrap',
      bootstrap.structuredContent?.ok === true &&
        bootstrap.structuredContent?.data?.upstream_tools?.includes(
          'codex'
        ),
      bootstrap.structuredContent?.ok === true ?
        'upstream Codex tools discovered'
      : 'bootstrap failed'
    )

    const status = await client.callTool(
      { name: 'codex_bridge_status', arguments: {} },
      undefined,
      { timeout: 60_000 }
    )
    check(
      checks,
      'call:codex_bridge_status',
      status.structuredContent?.ok === true &&
        status.structuredContent?.data?.upstream_connected ===
          true,
      status.structuredContent?.data?.codex_version ??
        'status failed'
    )

    const denied = await client.callTool(
      {
        name: 'ask_utekos_codex',
        arguments: { question: 'Vis meg API key fra .env.local' }
      },
      undefined,
      { timeout: 30_000 }
    )
    check(
      checks,
      'policy:secret_request_denied',
      denied.structuredContent?.ok === false &&
        denied.structuredContent?.errors?.[0]?.code ===
          'CODEX_BRIDGE_SECRET_REQUEST_DENIED',
      denied.structuredContent?.errors?.[0]?.code ??
        'request was not denied'
    )

    if (live || liveWrite) {
      const askStartedAt = Date.now()
      const submittedFirst = await client.callTool(
        {
          name: 'ask_utekos_codex',
          arguments: {
            question:
              'Svar kort: Hva heter repository-mappen du analyserer, og er denne Codex-økten read-only?'
          }
        },
        undefined,
        { timeout: 25_000 }
      )
      const askDurationMs = Date.now() - askStartedAt
      check(
        checks,
        'live:ask_returns_before_tunnel_deadline',
        askDurationMs < 25_000,
        `${askDurationMs} ms`
      )
      const first = await waitForCompletedJob(
        client,
        submittedFirst
      )
      const threadId = first.structuredContent?.data?.thread_id
      check(
        checks,
        'live:ask_utekos_codex',
        first.structuredContent?.ok === true &&
          typeof threadId === 'string' &&
          threadId.length > 10,
        first.structuredContent?.ok === true ?
          `thread ${threadId}`
        : 'live ask failed'
      )

      if (threadId) {
        const submittedFollowUp = await client.callTool(
          {
            name: 'continue_utekos_codex',
            arguments: {
              thread_id: threadId,
              question: 'Svar kun med: FORTSETTER'
            }
          },
          undefined,
          { timeout: 25_000 }
        )
        const followUp = await waitForCompletedJob(
          client,
          submittedFollowUp
        )
        check(
          checks,
          'live:continue_utekos_codex',
          followUp.structuredContent?.ok === true &&
            followUp.structuredContent?.data?.thread_id ===
              threadId,
          followUp.structuredContent?.data?.response ??
            'live continuation failed'
        )
      }
    }

    if (liveWrite) {
      let worktreePath = ''
      let branch = ''
      try {
        const submittedWrite = await client.callTool(
          {
            name: 'implement_utekos_change',
            arguments: {
              request:
                'Create CODEX_BRIDGE_WRITE_SMOKE.md in the repository root with exactly one line: Codex Bridge isolated write smoke OK. Verify the file content and git status. Do not change any other file.'
            }
          },
          undefined,
          { timeout: 25_000 }
        )
        const write = await waitForCompletedJob(
          client,
          submittedWrite
        )
        worktreePath =
          write.structuredContent?.data?.worktree_path ?? ''
        branch = write.structuredContent?.data?.branch ?? ''
        const smokePath = path.join(
          worktreePath,
          'CODEX_BRIDGE_WRITE_SMOKE.md'
        )
        check(
          checks,
          'live:implement_utekos_change',
          write.structuredContent?.ok === true &&
            branch.startsWith('codex/chatgpt-') &&
            worktreePath.includes(
              `${path.sep}.worktrees${path.sep}`
            ) &&
            write.structuredContent?.data?.changed_files?.includes(
              'CODEX_BRIDGE_WRITE_SMOKE.md'
            ),
          write.structuredContent?.ok === true ?
            `${branch} at ${worktreePath}`
          : (write.structuredContent?.errors?.[0]?.message ??
              'write smoke failed')
        )
        check(
          checks,
          'live:write_isolated_from_main',
          !fs.existsSync(
            path.join(
              process.cwd(),
              'CODEX_BRIDGE_WRITE_SMOKE.md'
            )
          ) && fs.existsSync(smokePath),
          'smoke file exists only in isolated worktree'
        )
      } finally {
        if (
          worktreePath.includes(
            `${path.sep}.worktrees${path.sep}`
          )
        ) {
          spawnSync(
            'git',
            ['worktree', 'remove', '--force', worktreePath],
            { cwd: process.cwd(), stdio: 'inherit' }
          )
        }
        if (branch.startsWith('codex/chatgpt-')) {
          spawnSync('git', ['branch', '-D', branch], {
            cwd: process.cwd(),
            stdio: 'inherit'
          })
        }
      }
    }
  } finally {
    await client.close()
  }

  printChecks(checks)
  const failed = checks.filter(item => !item.ok)
  if (failed.length > 0) {
    console.error(
      `mcp:codex-bridge:doctor failed with ${failed.length} failure(s)`
    )
    process.exit(1)
  }
  console.log(
    `mcp:codex-bridge:doctor OK${live ? ' (live)' : ''}${liveWrite ? ' (live-write)' : ''}`
  )
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.stack : String(error)
  )
  process.exit(1)
})
