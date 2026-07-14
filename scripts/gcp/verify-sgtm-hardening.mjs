#!/usr/bin/env node

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import { promisify } from 'node:util'
import process from 'node:process'

import { verifySgtmHardeningState } from './lib/sgtm-hardening.mjs'

const execFileAsync = promisify(execFile)
const config = JSON.parse(fs.readFileSync(process.env.SGTM_HARDENING_CONFIG || 'config/gcp/sgtm-production-hardening.json', 'utf8'))
const readErrors = []

async function gcloud(args, fallback = [], label = args.slice(0, 3).join(' ')) {
  try {
    const { stdout } = await execFileAsync('gcloud', args, { maxBuffer: 8 * 1024 * 1024, timeout: 15_000 })
    return JSON.parse(stdout || JSON.stringify(fallback))
  } catch (error) {
    readErrors.push(`${label}: ${String(error?.stderr || error?.message || '').trim()}`)
    return fallback
  }
}

async function vercelEnv(target) {
  try {
    const { stdout } = await execFileAsync('pnpm', [
      'dlx', 'vercel@latest', 'env', 'ls', target, '--format=json', '--non-interactive',
      `--scope=${config.vercel.teamSlug}`, '--cwd=.'
    ], { maxBuffer: 8 * 1024 * 1024, timeout: 15_000 })
    return JSON.parse(stdout)
  } catch (error) {
    readErrors.push(`Vercel ${target} env: ${String(error?.stderr || error?.message || '').trim()}`)
    return { envs: [] }
  }
}

async function validateLatestSecretMaterial() {
  try {
    const { stdout } = await execFileAsync('gcloud', [
      'secrets', 'versions', 'access', 'latest', `--secret=${config.secret.name}`,
      `--project=${config.projectId}`
    ], { maxBuffer: 1024 * 1024, timeout: 15_000 })
    const parsed = JSON.parse(stdout)
    const encoded = parsed?.keys?.[config.secret.keyId]
    if (typeof encoded !== 'string') throw new Error('missing key')
    const bytes = Buffer.from(encoded, 'base64')
    if (bytes.length < 32 || bytes.toString('base64') !== encoded) throw new Error('invalid key')
    return true
  } catch {
    readErrors.push('Secret Manager latest material: validation failed without exposing secret output')
    return false
  }
}

const projectArg = `--project=${config.projectId}`
let vercelLink
try {
  vercelLink = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'))
} catch {
  vercelLink = {}
}
const [service, secretResource, secretVersion, secretMaterialValid, secretIamPolicy, uptimeChecks, notificationChannels, alertPolicies, loggingMetrics, budgets, vercelPreviewEnv, vercelProductionEnv] = await Promise.all([
  gcloud(['run', 'services', 'describe', config.service, projectArg, `--region=${config.region}`, '--format=json'], {}, 'Cloud Run service'),
  gcloud(['secrets', 'describe', config.secret.name, projectArg, '--format=json'], {}, 'Secret Manager resource'),
  gcloud(['secrets', 'versions', 'describe', 'latest', `--secret=${config.secret.name}`, projectArg, '--format=json'], {}, 'Secret Manager latest version'),
  validateLatestSecretMaterial(),
  gcloud(['secrets', 'get-iam-policy', config.secret.name, projectArg, '--format=json'], {}, 'Secret Manager IAM'),
  gcloud(['monitoring', 'uptime', 'list-configs', projectArg, '--format=json']),
  gcloud(['beta', 'monitoring', 'channels', 'list', projectArg, '--format=json']),
  gcloud(['monitoring', 'policies', 'list', projectArg, '--format=json']),
  gcloud(['logging', 'metrics', 'list', projectArg, '--format=json']),
  gcloud(['billing', 'budgets', 'list', `--billing-account=${config.budget.billingAccount}`, projectArg, '--format=json']),
  vercelEnv('preview'),
  vercelEnv('production')
])

const result = verifySgtmHardeningState(config, {
  service,
  secretResource,
  secretVersion,
  secretMaterialValid,
  secretIamPolicy,
  uptimeChecks,
  notificationChannels,
  alertPolicies,
  loggingMetrics,
  budgets,
  vercelPreviewEnv,
  vercelProductionEnv,
  vercelLink
})
if (readErrors.length > 0) {
  result.ok = false
  result.failures.unshift(...readErrors.map(error => `read failed: ${error}`))
}

console.log(JSON.stringify(result, null, 2))
process.exitCode = result.ok ? 0 : 1
