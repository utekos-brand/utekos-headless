import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { OAuth2Client } from 'google-auth-library'

const SOURCE = 'tagmanager.googleapis.com/workspaces.quick_preview'
const ENTITY_KINDS = [
  'tag',
  'trigger',
  'variable',
  'folder',
  'client',
  'transformation',
  'zone',
  'customTemplate',
  'builtInVariable',
  'gtagConfig'
]

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]))
}

function stableJson(value) {
  return JSON.stringify(stableValue(value))
}

function digest(value) {
  return crypto.createHash('sha256').update(stableJson(value)).digest('hex')
}

function previewResources(containerVersion = {}) {
  const resources = {}
  for (const kind of ENTITY_KINDS) {
    if (containerVersion[kind]) resources[kind] = containerVersion[kind]
  }
  return resources
}

function normalizedPreviewResponse(preview) {
  return {
    compilerError: preview.compilerError === true,
    syncStatus: preview.syncStatus || {},
    containerVersion: {
      ...preview.containerVersion,
      fingerprint: undefined
    }
  }
}

function entityId(kind, entity) {
  const key = kind === 'customTemplate' ? 'templateId' : `${kind}Id`
  return entity[key]
}

export function canonicalizeWorkspaceChanges(status) {
  return (status.workspaceChange || []).map(change => {
    const kind = ENTITY_KINDS.find(candidate => change[candidate])
    if (!kind) throw new Error('GTM workspace status included an unsupported entity kind')
    const entity = change[kind]
    return {
      changeStatus: change.changeStatus,
      kind,
      ...(entityId(kind, entity) ? { id: entityId(kind, entity) } : {}),
      name: entity.name || String(entity.type || '')
    }
  }).sort((left, right) => stableJson(left).localeCompare(stableJson(right)))
}

export function canonicalizeExpectedChanges(changes) {
  return changes.map(change => ({
    changeStatus: change.changeStatus,
    kind: change.kind,
    ...(change.id ? { id: change.id } : {}),
    name: change.name
  })).sort((left, right) => stableJson(left).localeCompare(stableJson(right)))
}

export function buildQuickPreviewEvidence({
  generatedAt,
  target,
  workspaceFingerprint,
  live,
  status,
  preview
}) {
  return {
    source: SOURCE,
    generatedAt,
    target: {
      accountId: target.accountId,
      containerId: target.containerId,
      workspaceId: target.workspaceId
    },
    workspaceFingerprint,
    live: {
      containerVersionId: live.containerVersionId,
      fingerprint: live.fingerprint
    },
    compilerError: preview.compilerError === true,
    syncStatus: {
      mergeConflict: preview.syncStatus?.mergeConflict === true,
      syncError: preview.syncStatus?.syncError === true
    },
    workspaceChanges: canonicalizeWorkspaceChanges(status),
    resourceDigest: digest(previewResources(preview.containerVersion)),
    responseDigest: digest(normalizedPreviewResponse(preview))
  }
}

function assertEqual(actual, expected, label) {
  if (stableJson(actual) !== stableJson(expected)) throw new Error(`${label} drifted`)
}

function assertExpectedChanges(actual, expected) {
  if (actual.length !== expected.length) throw new Error('GTM workspace change set drifted')
  const unmatched = [...actual]
  for (const descriptor of expected) {
    const index = unmatched.findIndex(change => Object.entries(descriptor).every(([key, value]) => change[key] === value))
    if (index === -1) throw new Error('GTM workspace change set drifted')
    unmatched.splice(index, 1)
  }
}

export function verifyQuickPreviewEvidence({ evidence, target, now, currentEvidence }) {
  if (evidence.source !== SOURCE) throw new Error('Quick Preview evidence source is not the official GTM API')
  const age = now - Date.parse(evidence.generatedAt)
  if (!Number.isFinite(age) || age < 0 || age > 60 * 60 * 1000) {
    throw new Error('Quick Preview evidence must be no more than one hour old')
  }
  if (evidence.compilerError) throw new Error('Quick Preview reported a compiler error')
  if (evidence.syncStatus?.mergeConflict || evidence.syncStatus?.syncError) {
    throw new Error('Quick Preview reported a sync failure or merge conflict')
  }
  assertEqual(evidence.target, {
    accountId: target.accountId,
    containerId: target.containerId,
    workspaceId: target.workspaceId
  }, 'Quick Preview target')
  assertEqual(evidence.live, {
    containerVersionId: target.liveVersion,
    fingerprint: target.liveFingerprint
  }, 'Quick Preview live baseline')
  assertExpectedChanges(evidence.workspaceChanges, canonicalizeExpectedChanges(target.expectedChanges))
  assertEqual(evidence.workspaceFingerprint, currentEvidence.workspaceFingerprint, 'GTM workspace fingerprint')
  if (evidence.resourceDigest !== currentEvidence.resourceDigest) throw new Error('Quick Preview resource digest drifted')
  if (evidence.responseDigest !== currentEvidence.responseDigest) throw new Error('Quick Preview response digest drifted')
  assertEqual(evidence.workspaceChanges, currentEvidence.workspaceChanges, 'Current GTM workspace change set')
  if (currentEvidence.compilerError || currentEvidence.syncStatus.mergeConflict || currentEvidence.syncStatus.syncError) {
    throw new Error('Current Quick Preview did not compile or sync cleanly')
  }
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export async function getGtmAccessToken() {
  const credentialsPath = process.env.GTM_CREDENTIALS_FILE
    || path.join(os.homedir(), '.config/gtm-mcp/credentials.json')
  const tokenPath = process.env.GTM_TOKEN_FILE
    || path.join(os.homedir(), '.config/gtm-mcp/token.json')
  const credentials = readJson(credentialsPath)
  const token = readJson(tokenPath)
  const clientConfig = credentials.installed || credentials.web
  if (!clientConfig?.client_id || !clientConfig?.client_secret) {
    throw new Error('GTM OAuth client credentials are incomplete')
  }
  const client = new OAuth2Client(
    clientConfig.client_id,
    clientConfig.client_secret,
    clientConfig.redirect_uris?.[0] || 'http://localhost'
  )
  client.setCredentials(token)
  const result = await client.getAccessToken()
  if (!result.token) throw new Error('Unable to obtain a GTM access token')
  return result.token
}

async function gtmRequest(accessToken, resourcePath, method = 'GET') {
  const response = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${resourcePath}`, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(20_000)
  })
  if (!response.ok) throw new Error(`GTM ${method} ${resourcePath} failed with HTTP ${response.status}`)
  return response.json()
}

export async function captureTargetEvidence(accessToken, target, generatedAt = new Date().toISOString()) {
  const root = `accounts/${target.accountId}/containers/${target.containerId}`
  const workspace = `${root}/workspaces/${target.workspaceId}`
  const [live, workspaceState, status, preview] = await Promise.all([
    gtmRequest(accessToken, `${root}/versions:live`),
    gtmRequest(accessToken, workspace),
    gtmRequest(accessToken, `${workspace}/status`),
    gtmRequest(accessToken, `${workspace}:quick_preview`, 'POST')
  ])
  return buildQuickPreviewEvidence({
    generatedAt,
    target,
    workspaceFingerprint: workspaceState.fingerprint,
    live,
    status,
    preview
  })
}

export async function readLoaderClient(accessToken, target) {
  const clientPath = `accounts/${target.accountId}/containers/${target.containerId}/workspaces/${target.workspaceId}/clients/${target.loaderClient.clientId}`
  return gtmRequest(accessToken, clientPath)
}
