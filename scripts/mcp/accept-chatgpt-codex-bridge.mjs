#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const args = process.argv.slice(2)
const logPath = path.join(
  root,
  '.agent-artifacts/tunnel/utekos-chatgpt-codex-bridge.log'
)
const statusDir = path.join(root, '.agent-artifacts/chatgpt')
const statusJsonPath = path.join(
  statusDir,
  'codex-bridge-acceptance.json'
)
const statusMdPath = path.join(
  statusDir,
  'codex-bridge-acceptance.md'
)
const canonicalCommand = `node ${path.join(root, 'scripts/mcp/utekos-codex-bridge-server.mjs')}`
const canonicalToolNames = [
  'codex_bridge_bootstrap',
  'ask_utekos_codex',
  'implement_utekos_change',
  'continue_utekos_codex',
  'get_utekos_codex_result',
  'codex_bridge_status'
]
const requiredObservedTools = [
  'codex_bridge_bootstrap',
  'implement_utekos_change',
  'get_utekos_codex_result'
]
const acceptancePrompt =
  'Use the Utekos Codex Bridge app. Call codex_bridge_bootstrap, then call implement_utekos_change with this request: "Create CODEX_BRIDGE_CHATGPT_ACCEPTANCE.md in the repository root with exactly one line: ChatGPT to Codex isolated write accepted. Verify the file content and git status. Do not change any other file." Poll get_utekos_codex_result with the returned job_id until completed. Return thread_id, branch, worktree_path, changed_files, git_status, diff_stat, and the Codex summary. Do not commit, push, merge, deploy, publish GTM, or mutate an external provider.'

function hasFlag(name) {
  return args.includes(name)
}

function numberFlag(name, fallback) {
  const index = args.indexOf(name)
  if (index === -1) return fallback
  const value = Number(args[index + 1])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function run(command, commandArgs) {
  return spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

function sleep(ms) {
  spawnSync('sleep', [String(ms / 1000)], { stdio: 'ignore' })
}

function latestRunLog() {
  if (!fs.existsSync(logPath)) return ''
  const log = fs.readFileSync(logPath, 'utf8')
  const marker = '"msg":"tunnel-client startup summary"'
  const index = log.lastIndexOf(marker)
  return index === -1 ? log : log.slice(index)
}

function observedTools(log) {
  const found = new Set()
  for (const line of log.split('\n')) {
    if (!line.includes('"msg":"utekos_codex_bridge_tool_call"'))
      continue
    try {
      const event = JSON.parse(line)
      if (typeof event.tool === 'string') found.add(event.tool)
    } catch {
      // Tunnel-client may add non-JSON lines around server stderr.
    }
  }
  return [...found].sort()
}

function buildChecks({ includeDoctor }) {
  const checks = []
  const status = run('npm', [
    'run',
    'mcp:tunnel:status:codex-bridge'
  ])
  const statusOutput = `${status.stdout}\n${status.stderr}`
  checks.push({
    name: 'tunnel_status',
    ok: status.status === 0,
    pending: false,
    message: status.status === 0 ? 'healthy' : 'not healthy'
  })
  checks.push({
    name: 'canonical_mcp_command',
    ok: statusOutput.includes(`mcp_command=${canonicalCommand}`),
    pending: false,
    message:
      statusOutput.includes(`mcp_command=${canonicalCommand}`) ?
        canonicalCommand
      : 'unexpected or missing MCP command'
  })

  if (includeDoctor) {
    const doctor = run('npm', ['run', 'mcp:codex-bridge:doctor'])
    checks.push({
      name: 'codex_bridge_doctor',
      ok: doctor.status === 0,
      pending: false,
      message:
        doctor.status === 0 ?
          'canonical bridge contract passes'
        : 'local bridge doctor failed'
    })
  }

  const log = latestRunLog()
  checks.push({
    name: 'tunnel_log',
    ok: log.length > 0,
    pending: false,
    message:
      fs.existsSync(logPath) ? logPath : 'missing log file'
  })
  checks.push({
    name: 'log_target_canonical',
    ok:
      log.includes(`"mcp_target_value":"${canonicalCommand}"`) ||
      log.includes(`"command":"${canonicalCommand}"`),
    pending: false,
    message:
      'latest tunnel run targets Utekos Codex Bridge stdio server'
  })

  const tools = observedTools(log)
  const nonCanonical = tools.filter(
    tool => !canonicalToolNames.includes(tool)
  )
  checks.push({
    name: 'canonical_surface_only',
    ok: nonCanonical.length === 0,
    pending: false,
    message:
      nonCanonical.length === 0 ?
        'no unexpected bridge tools observed'
      : `unexpected tools: ${nonCanonical.join(', ')}`
  })

  const missing = requiredObservedTools.filter(
    tool => !tools.includes(tool)
  )
  checks.push({
    name: 'chatgpt_bridge_calls',
    ok: missing.length === 0,
    pending: missing.length > 0,
    observed_tools: tools,
    missing_tools: missing,
    message:
      missing.length === 0 ?
        `observed: ${requiredObservedTools.join(', ')}`
      : `pending; missing: ${missing.join(', ')}`
  })
  return checks
}

function resultFor(checks) {
  if (checks.some(check => !check.ok && !check.pending))
    return 'fail'
  if (checks.some(check => check.pending)) return 'pending'
  return 'accepted'
}

function writeStatus(checks, result) {
  fs.mkdirSync(statusDir, { recursive: true })
  const callCheck = checks.find(
    check => check.name === 'chatgpt_bridge_calls'
  )
  const report = {
    generated_at: new Date().toISOString(),
    result,
    accepted: result === 'accepted',
    tunnel_log: logPath,
    canonical_mcp_command: canonicalCommand,
    canonical_tool_names: canonicalToolNames,
    required_observed_tools: requiredObservedTools,
    observed_tools: callCheck?.observed_tools ?? [],
    missing_tools: callCheck?.missing_tools ?? [],
    chatgpt_prompt: acceptancePrompt,
    checks: checks.map(({ name, ok, pending, message }) => ({
      name,
      ok,
      pending,
      message
    }))
  }
  fs.writeFileSync(
    statusJsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  )
  fs.writeFileSync(
    statusMdPath,
    [
      '# ChatGPT Codex Bridge Acceptance',
      '',
      `- Generated: ${report.generated_at}`,
      `- Result: ${report.result}`,
      `- Accepted: ${report.accepted}`,
      `- Tunnel log: ${report.tunnel_log}`,
      `- Observed tools: ${report.observed_tools.join(', ') || '-'}`,
      `- Missing tools: ${report.missing_tools.join(', ') || '-'}`,
      '',
      '## ChatGPT prompt',
      '',
      '```text',
      acceptancePrompt,
      '```',
      '',
      '## Checks',
      '',
      ...report.checks.map(
        check =>
          `- ${
            check.ok ? 'PASS'
            : check.pending ? 'PENDING'
            : 'FAIL'
          } ${check.name}: ${check.message}`
      ),
      ''
    ].join('\n'),
    'utf8'
  )
}

function printChecks(checks) {
  for (const check of checks) {
    console.log(
      `${(check.ok ? 'PASS'
      : check.pending ? 'PENDING'
      : 'FAIL'
      ).padEnd(8)} ${check.name.padEnd(30)} ${check.message}`
    )
  }
}

function finish(checks) {
  printChecks(checks)
  const result = resultFor(checks)
  writeStatus(checks, result)
  if (result === 'fail') {
    console.error('RESULT fail')
    process.exit(1)
  }
  if (result === 'pending') {
    console.error('RESULT ready_pending_chatgpt_call')
    console.error(`NEXT ${acceptancePrompt}`)
    process.exit(2)
  }
  console.log('RESULT accepted')
}

function main() {
  if (!hasFlag('--watch')) {
    finish(buildChecks({ includeDoctor: true }))
    return
  }

  const timeoutMs = numberFlag('--timeout-ms', 16 * 60 * 1000)
  const intervalMs = numberFlag('--interval-ms', 3_000)
  const deadline = Date.now() + timeoutMs
  let checks = buildChecks({ includeDoctor: true })
  printChecks(checks)
  if (resultFor(checks) === 'fail') finish(checks)
  if (resultFor(checks) === 'accepted') finish(checks)

  console.error(
    `WATCH waiting for ChatGPT bridge calls for ${timeoutMs}ms`
  )
  console.error(`NEXT ${acceptancePrompt}`)
  while (Date.now() < deadline) {
    sleep(intervalMs)
    checks = buildChecks({ includeDoctor: false })
    const result = resultFor(checks)
    writeStatus(checks, result)
    if (result !== 'pending')
      finish(buildChecks({ includeDoctor: true }))
  }
  finish(buildChecks({ includeDoctor: true }))
}

main()
