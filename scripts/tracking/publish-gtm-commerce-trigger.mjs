#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'
import { OAuth2Client } from 'google-auth-library'

const DEFAULT_ACCOUNT_ID = '6295468138'
const DEFAULT_CONTAINER_ID = '220236256'
const DEFAULT_WORKSPACE_ID = '106'
const DEFAULT_TRIGGER_ID = '122'
const DEFAULT_PUBLIC_CONTAINER_ID = 'GTM-5TWMJQFP'
const COMMERCE_EVENT_REGEX =
  '^(page_view|view_item_list|select_item|view_item|add_to_cart|begin_checkout|purchase|search|generate_lead)$'

function resolvePath(envValue, fallback) {
  return envValue?.trim() || fallback
}

function loadJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

async function getAccessToken(credentialsPath, tokenPath) {
  const credentials = loadJson(credentialsPath)
  const token = loadJson(tokenPath)
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web
  const client = new OAuth2Client(client_id, client_secret, redirect_uris?.[0] || 'http://localhost')
  client.setCredentials(token)
  const { token: accessToken } = await client.getAccessToken()

  if (!accessToken) {
    throw new Error('Failed to resolve GTM access token. Re-run gtm-mcp-auth with tagmanager.publish scope.')
  }

  return accessToken
}

async function gtmRequest(accessToken, path, options = {}) {
  const response = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    }
  })
  const text = await response.text()

  if (!response.ok) {
    throw new Error(`${response.status} ${text}`)
  }

  return text ? JSON.parse(text) : null
}

async function ensureTriggerRegex(accessToken, accountId, containerId, workspaceId, triggerId) {
  const trigger = await gtmRequest(
    accessToken,
    `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`
  )
  const currentRegex = trigger.customEventFilter?.[0]?.parameter?.find(parameter => parameter.key === 'arg1')?.value

  if (currentRegex === COMMERCE_EVENT_REGEX) {
    return { updated: false, currentRegex }
  }

  const updatedTrigger = {
    ...trigger,
    customEventFilter: [
      {
        type: 'matchRegex',
        parameter: [
          { type: 'template', key: 'arg0', value: '{{_event}}' },
          { type: 'template', key: 'arg1', value: COMMERCE_EVENT_REGEX }
        ]
      }
    ]
  }

  delete updatedTrigger.fingerprint

  const result = await gtmRequest(
    accessToken,
    `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updatedTrigger)
    }
  )

  return {
    updated: true,
    currentRegex,
    nextRegex: result.customEventFilter?.[0]?.parameter?.find(parameter => parameter.key === 'arg1')?.value
  }
}

async function publishWorkspace(accessToken, accountId, containerId, workspaceId, versionName, versionNotes) {
  const version = await gtmRequest(
    accessToken,
    `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}:create_version`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: versionName,
        notes: versionNotes
      })
    }
  )

  const versionId = version.containerVersion?.containerVersionId
  if (!versionId) {
    throw new Error('GTM create_version returned no containerVersionId.')
  }

  const published = await gtmRequest(
    accessToken,
    `accounts/${accountId}/containers/${containerId}/versions/${versionId}:publish`,
    { method: 'POST' }
  )

  return {
    versionId,
    versionName: published.containerVersion?.name || version.containerVersion?.name,
    fingerprint: published.containerVersion?.fingerprint
  }
}

async function verifyPublishedContainer(publicContainerId) {
  const response = await fetch(`https://cloud.server.utekos.no/gtm.js?id=${encodeURIComponent(publicContainerId)}`)
  const body = await response.text()

  if (!response.ok) {
    throw new Error(`Published container probe failed with HTTP ${response.status}.`)
  }

  const versionMatch = body.match(/"version":"(\d+)"/)
  const regexMatch = body.match(/matchRegex","arg1","value":"([^"]+)"/)
    || body.match(/arg1\\",\\"value\\":\\"(\^[^\\"]+)\\"/)

  return {
    httpStatus: response.status,
    publishedVersion: versionMatch?.[1] || null,
    publishedRegex: regexMatch?.[1]?.replace(/\\\//g, '/') || null
  }
}

async function main() {
  const credentialsPath = resolvePath(
    process.env.GTM_CREDENTIALS_FILE,
    `${process.env.HOME}/.config/gtm-mcp/credentials.json`
  )
  const tokenPath = resolvePath(
    process.env.GTM_TOKEN_FILE,
    `${process.env.HOME}/.config/gtm-mcp/token.json`
  )
  const accountId = process.env.GTM_ACCOUNT_ID || DEFAULT_ACCOUNT_ID
  const containerId = process.env.GTM_CONTAINER_ID || DEFAULT_CONTAINER_ID
  const workspaceId = process.env.GTM_WORKSPACE_ID || DEFAULT_WORKSPACE_ID
  const triggerId = process.env.GTM_TRIGGER_ID || DEFAULT_TRIGGER_ID
  const publicContainerId = process.env.NEXT_PUBLIC_GOOGLE_GTM_ID || DEFAULT_PUBLIC_CONTAINER_ID
  const dryRun = process.env.GTM_PUBLISH_DRY_RUN === '1'

  const accessToken = await getAccessToken(credentialsPath, tokenPath)
  const triggerResult = await ensureTriggerRegex(accessToken, accountId, containerId, workspaceId, triggerId)

  if (dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      accountId,
      containerId,
      workspaceId,
      triggerId,
      triggerResult,
      expectedRegex: COMMERCE_EVENT_REGEX
    }, null, 2))
    return
  }

  const publishResult = await publishWorkspace(
    accessToken,
    accountId,
    containerId,
    workspaceId,
    process.env.GTM_PUBLISH_VERSION_NAME || 'Web: GA4 commerce trigger includes select_item + view_item_list',
    process.env.GTM_PUBLISH_VERSION_NOTES
      || 'Adds select_item and view_item_list to Canonical GA4 business events regex. PageView dedup unchanged.'
  )

  const verification = await verifyPublishedContainer(publicContainerId)

  console.log(JSON.stringify({
    accountId,
    containerId,
    workspaceId,
    triggerId,
    triggerResult,
    publishResult,
    verification,
    expectedRegex: COMMERCE_EVENT_REGEX
  }, null, 2))

  if (verification.publishedRegex !== COMMERCE_EVENT_REGEX) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
