#!/usr/bin/env node

import crypto from 'node:crypto'
import { execFile, spawn } from 'node:child_process'
import fs from 'node:fs'
import { promisify } from 'node:util'
import process from 'node:process'

import { isExplicitNotFound } from './lib/sgtm-hardening.mjs'

const execFileAsync = promisify(execFile)
const config = JSON.parse(fs.readFileSync(process.env.SGTM_HARDENING_CONFIG || 'config/gcp/sgtm-production-hardening.json', 'utf8'))
const phase = process.env.SGTM_HARDENING_PHASE || 'plan'
const projectArg = `--project=${config.projectId}`

function commandPlan() {
  return {
    mode: 'dry-run',
    phases: [
      { phase: 'vercel-preview', confirmation: 'I_APPROVE_VERCEL_PREVIEW_SECRET', action: 'create/reuse key and set Preview only' },
      { phase: 'vercel-production', confirmation: 'I_APPROVE_VERCEL_PRODUCTION_SECRET', action: 'reuse exact key and set Production only' },
      { phase: 'cloud-secret', confirmation: 'I_APPROVE_SGTM_CLOUD_SECRET_MUTATION', action: 'identity, IAM, file mount and SGTM_CREDENTIALS' },
      { phase: 'budget-api', confirmation: 'I_APPROVE_BUDGET_API_ENABLE', action: 'enable billingbudgets.googleapis.com only' },
      { phase: 'operations', confirmation: 'I_APPROVE_SGTM_OPERATIONS_MUTATION', action: 'capacity, uptime, metrics, alerts and budget' }
    ],
    note: 'No phase runs without its exact confirmation. Secret material is never printed or written to disk.'
  }
}

async function run(args, options = {}) {
  return execFileAsync(args[0], args.slice(1), { maxBuffer: 8 * 1024 * 1024, ...options })
}

async function runWithInput(command, args, input) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['pipe', 'ignore', 'pipe'] })
    let errorOutput = ''
    child.stderr.on('data', chunk => { errorOutput += String(chunk) })
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`${command} failed: ${errorOutput.trim()}`)))
    child.stdin.end(input)
  })
}

function parseSecret(jsonText) {
  const parsed = JSON.parse(jsonText)
  const encoded = parsed?.keys?.[config.secret.keyId]
  const bytes = encoded ? Buffer.from(encoded, 'base64') : Buffer.alloc(0)
  if (bytes.length < 32 || bytes.toString('base64') !== encoded) {
    throw new Error('Existing sGTM key is not canonical base64 for at least 32 bytes')
  }
  return encoded
}

async function readExistingSecret() {
  try {
    const { stdout } = await run(['gcloud', 'secrets', 'versions', 'access', 'latest', `--secret=${config.secret.name}`, projectArg])
    return parseSecret(stdout)
  } catch (error) {
    throw new Error(`Existing sGTM secret could not be accessed and will not be replaced: ${String(error?.stderr || error?.message || '').trim()}`)
  }
}

async function createOrReadSecretForPreview() {
  try {
    await run(['gcloud', 'secrets', 'describe', config.secret.name, projectArg])
    return readExistingSecret()
  } catch (error) {
    if (!isExplicitNotFound(error)) throw new Error('Secret preflight failed; refusing to create or rotate a key')
  }

  const encoded = crypto.randomBytes(32).toString('base64')
  const document = JSON.stringify({ keys: { [config.secret.keyId]: encoded } })
  await run(['gcloud', 'secrets', 'create', config.secret.name, projectArg, '--replication-policy=automatic'])
  await runWithInput('gcloud', ['secrets', 'versions', 'add', config.secret.name, projectArg, '--data-file=-'], document)
  return encoded
}

function assertVercelLink() {
  const link = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'))
  if (link.projectId !== config.vercel.projectId
    || link.orgId !== config.vercel.orgId
    || link.projectName !== config.vercel.projectName) {
    throw new Error('Vercel link does not match the approved project and team')
  }
}

async function syncVercelSecret(target, encoded) {
  assertVercelLink()
  await runWithInput('pnpm', [
    'dlx', 'vercel@latest', 'env', 'add', config.vercel.receiptEnvKey, target,
    '--force', '--sensitive', '--non-interactive', `--scope=${config.vercel.teamSlug}`, '--cwd=.'
  ], `${encoded}\n`)
}

function requireConfirmation(expected) {
  if (process.env.SGTM_HARDENING_APPLY !== expected) {
    throw new Error(`This phase requires SGTM_HARDENING_APPLY=${expected}`)
  }
}

async function applyVercelPreview() {
  requireConfirmation('I_APPROVE_VERCEL_PREVIEW_SECRET')
  assertVercelLink()
  const encoded = await createOrReadSecretForPreview()
  await syncVercelSecret('preview', encoded)
  console.log(JSON.stringify({ ok: true, phase, secretPrinted: false }, null, 2))
}

async function applyVercelProduction() {
  requireConfirmation('I_APPROVE_VERCEL_PRODUCTION_SECRET')
  assertVercelLink()
  const encoded = await readExistingSecret()
  await syncVercelSecret('production', encoded)
  console.log(JSON.stringify({ ok: true, phase, secretPrinted: false }, null, 2))
}

async function applyCloudSecret() {
  requireConfirmation('I_APPROVE_SGTM_CLOUD_SECRET_MUTATION')
  await readExistingSecret()

  try {
    await run(['gcloud', 'iam', 'service-accounts', 'describe', config.serviceAccount, projectArg])
  } catch (error) {
    if (!isExplicitNotFound(error)) throw new Error('Service-account preflight failed')
    await run(['gcloud', 'iam', 'service-accounts', 'create', 'sgtm-runtime', projectArg, '--display-name=Utekos sGTM runtime'])
  }

  await run([
    'gcloud', 'secrets', 'add-iam-policy-binding', config.secret.name, projectArg,
    `--member=serviceAccount:${config.serviceAccount}`,
    '--role=roles/secretmanager.secretAccessor', '--quiet'
  ])
  await run([
    'gcloud', 'run', 'services', 'update', config.service, projectArg, `--region=${config.region}`,
    `--service-account=${config.serviceAccount}`,
    `--update-secrets=${config.secret.mountPath}=${config.secret.name}:latest`,
    `--update-env-vars=${config.secret.environmentVariable}=${config.secret.mountPath}`,
    '--quiet'
  ])
  console.log(JSON.stringify({ ok: true, phase, secretPrinted: false }, null, 2))
}

async function listJson(args, label) {
  try {
    const { stdout } = await run([...args, '--format=json'])
    return JSON.parse(stdout || '[]')
  } catch (error) {
    throw new Error(`${label} preflight failed: ${String(error?.stderr || error?.message || '').trim()}`)
  }
}

function normalized(value) {
  if (Array.isArray(value)) return value.map(normalized).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).filter(key => key !== 'name').sort().map(key => [key, normalized(value[key])]))
}

function equal(left, right) {
  return JSON.stringify(normalized(left)) === JSON.stringify(normalized(right))
}

function assertNoNamedDrift({ uptimes, channels, metrics, policies, budgets, address }) {
  const uptime = uptimes.find(item => item.displayName === config.uptime.displayName)
  if (uptime && (
    uptime.monitoredResource?.labels?.host !== config.uptime.host
    || uptime.httpCheck?.path !== config.uptime.path
    || uptime.httpCheck?.useSsl !== true
    || !equal(uptime.selectedRegions || [], config.uptime.selectedRegions)
  )) throw new Error('Same-name uptime check drifted; reconcile it explicitly before mutation')

  const matchingChannels = channels.filter(item => item.type === config.notificationChannel.type && item.labels?.email_address === address)
  if (matchingChannels.some(item => item.enabled === false)) throw new Error('Approved notification channel exists but is disabled')

  for (const expected of config.loggingMetrics) {
    const actual = metrics.find(item => item.name?.endsWith(`/metrics/${expected.name}`) || item.name === expected.name)
    if (actual && (actual.filter !== expected.filter || actual.metricDescriptor?.metricKind !== expected.metricKind)) {
      throw new Error(`Same-name logging metric ${expected.name} drifted; reconcile it explicitly`)
    }
  }

  const channel = matchingChannels.find(item => item.enabled !== false)
  for (const expected of config.requiredAlertPolicies) {
    const actual = policies.find(item => item.displayName === expected.displayName)
    if (actual && (
      actual.enabled === false
      || actual.conditions?.length !== 1
      || !equal(actual.conditions[0], expected.condition)
      || (channel?.name && !(actual.notificationChannels || []).includes(channel.name))
    )) throw new Error(`Same-name alert policy ${expected.displayName} drifted; reconcile it explicitly`)
  }

  const budget = budgets.find(item => item.displayName === config.budget.displayName)
  if (budget) {
    const thresholds = (budget.thresholdRules || []).map(rule => Number(rule.thresholdPercent)).sort()
    if (!budget.amount?.lastPeriodAmount || !equal(thresholds, [...config.budget.thresholdRules].sort())
      || (channel?.name && !(budget.notificationsRule?.monitoringNotificationChannels || []).includes(channel.name))) {
      throw new Error('Same-name budget drifted; reconcile it explicitly before mutation')
    }
  }
}

async function applyBudgetApi() {
  requireConfirmation('I_APPROVE_BUDGET_API_ENABLE')
  await run(['gcloud', 'services', 'enable', 'billingbudgets.googleapis.com', projectArg, '--quiet'])
  console.log(JSON.stringify({ ok: true, phase }, null, 2))
}

async function applyOperations() {
  requireConfirmation('I_APPROVE_SGTM_OPERATIONS_MUTATION')
  const address = process.env[config.notificationChannel.addressEnv]
  if (!address) throw new Error(`${config.notificationChannel.addressEnv} is required`)

  const [uptimes, channels, metrics, policies, budgets] = await Promise.all([
    listJson(['gcloud', 'monitoring', 'uptime', 'list-configs', projectArg], 'uptime'),
    listJson(['gcloud', 'beta', 'monitoring', 'channels', 'list', projectArg], 'notification channels'),
    listJson(['gcloud', 'logging', 'metrics', 'list', projectArg], 'logging metrics'),
    listJson(['gcloud', 'monitoring', 'policies', 'list', projectArg], 'alert policies'),
    listJson(['gcloud', 'billing', 'budgets', 'list', `--billing-account=${config.budget.billingAccount}`, projectArg], 'billing budgets (enable the API through the separately approved budget-api phase if disabled)')
  ])
  assertNoNamedDrift({ uptimes, channels, metrics, policies, budgets, address })

  await run([
    'gcloud', 'run', 'services', 'update', config.service, projectArg, `--region=${config.region}`,
    `--min=${config.capacity.minInstances}`, `--max=${config.capacity.maxInstances}`,
    `--concurrency=${config.capacity.concurrency}`, '--quiet'
  ])

  if (!uptimes.some(item => item.displayName === config.uptime.displayName)) {
    await run([
      'gcloud', 'monitoring', 'uptime', 'create', config.uptime.displayName, projectArg,
      '--resource-type=uptime-url', `--resource-labels=host=${config.uptime.host},project_id=${config.projectId}`,
      '--protocol=https', '--validate-ssl=true', `--path=${config.uptime.path}`,
      `--regions=${config.uptime.selectedRegions.join(',')}`, '--status-classes=2xx', '--quiet'
    ])
  }

  let channel = channels.find(item => item.type === config.notificationChannel.type && item.labels?.email_address === address && item.enabled !== false)
  if (!channel) {
    const { stdout } = await run([
      'gcloud', 'beta', 'monitoring', 'channels', 'create', projectArg,
      '--display-name=Utekos sGTM operations', `--type=${config.notificationChannel.type}`,
      `--channel-labels=email_address=${address}`, '--format=json', '--quiet'
    ])
    channel = JSON.parse(stdout)
  }

  for (const metric of config.loggingMetrics) {
    if (!metrics.some(item => item.name?.endsWith(`/metrics/${metric.name}`) || item.name === metric.name)) {
      await run(['gcloud', 'logging', 'metrics', 'create', metric.name, projectArg, '--description=Utekos sGTM production alert input', `--log-filter=${metric.filter}`, '--quiet'])
    }
  }

  for (const policy of config.requiredAlertPolicies) {
    if (!policies.some(item => item.displayName === policy.displayName)) {
      const body = { displayName: policy.displayName, enabled: true, combiner: 'OR', notificationChannels: [channel.name], conditions: [policy.condition] }
      await run(['gcloud', 'monitoring', 'policies', 'create', projectArg, `--policy=${JSON.stringify(body)}`, '--quiet'])
    }
  }

  if (!budgets.some(item => item.displayName === config.budget.displayName)) {
    await run([
      'gcloud', 'billing', 'budgets', 'create', `--billing-account=${config.budget.billingAccount}`,
      projectArg,
      `--display-name=${config.budget.displayName}`, '--last-period-amount',
      ...config.budget.thresholdRules.map(percent => `--threshold-rule=percent=${percent}`),
      `--notifications-rule-monitoring-notification-channels=${channel.name}`, '--quiet'
    ])
  }
  console.log(JSON.stringify({ ok: true, phase }, null, 2))
}

if (phase === 'plan') {
  console.log(JSON.stringify(commandPlan(), null, 2))
} else if (phase === 'vercel-preview') {
  await applyVercelPreview()
} else if (phase === 'vercel-production') {
  await applyVercelProduction()
} else if (phase === 'cloud-secret') {
  await applyCloudSecret()
} else if (phase === 'budget-api') {
  await applyBudgetApi()
} else if (phase === 'operations') {
  await applyOperations()
} else {
  throw new Error('SGTM_HARDENING_PHASE must be plan, vercel-preview, vercel-production, cloud-secret, budget-api or operations')
}
