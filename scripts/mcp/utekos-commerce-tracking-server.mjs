#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { randomUUID } from 'node:crypto'

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { GoogleAuth, OAuth2Client } from 'google-auth-library'
import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server'
import { z } from 'zod/v4'

const repoRoot = path.resolve(process.env.UTEKOS_REPO_ROOT ?? process.cwd())
const profile = 'utekos_chatgpt_commerce_tracking'
const mode = 'live-diagnostics-read-only'
const microsoftOAuthTokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const microsoftOAuthScope = 'https://ads.microsoft.com/msads.manage offline_access'
const googleOAuthTokenUrl = 'https://oauth2.googleapis.com/token'
const googleAdsOAuthScope = 'https://www.googleapis.com/auth/adwords'
const googleTagManagerReadonlyScope = 'https://www.googleapis.com/auth/tagmanager.readonly'

let cachedMicrosoftAdsAccessToken = null
let cachedMicrosoftAdsAccessTokenExpiresAt = 0
let rotatedMicrosoftAdsRefreshToken = ''

const canonicalTools = [
  'commerce_tracking_bootstrap',
  'provider_env_readiness',
  'provider_access_remediation_report',
  'shopify_admin_catalog_probe',
  'shopify_storefront_product_probe',
  'ga4_event_status_probe',
  'merchant_center_status_probe',
  'google_ads_account_access_probe',
  'google_ads_campaign_performance_probe',
  'google_ads_conversion_action_probe',
  'google_ads_search_terms_probe',
  'posthog_project_discovery_probe',
  'posthog_event_status_probe',
  'sentry_issue_status_probe',
  'vercel_deployment_status_probe',
  'gtm_sgtm_endpoint_status_probe',
  'meta_dataset_quality_probe',
  'microsoft_uet_endpoint_status_probe',
  'microsoft_ads_auth_readiness_probe',
  'microsoft_ads_account_access_probe',
  'microsoft_ads_campaign_status_probe',
  'microsoft_ads_ad_insight_probe',
  'microsoft_shopping_content_status_probe',
  'microsoft_clarity_ads_status_probe',
  'gtm_api_workspace_probe',
  'tracking_architecture_inventory',
  'tracking_event_contract',
  'commerce_tracking_docs_map'
]

const expectedCommerceEvents = [
  'page_view',
  'view_item_list',
  'select_item',
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'purchase',
  'search',
  'generate_lead'
]

const readFirst = [
  'AGENTS.md',
  'docs/agent-operating-contract.md',
  'docs/agent-context-map.md',
  'docs/tracing.md',
  'src/lib/tracking/server-side-tagging.md',
  'config/mcp/credentials.manifest.json'
]

const providerDefinitions = [
  {
    id: 'shopify_storefront',
    label: 'Shopify Storefront',
    env: ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_STOREFRONT_ACCESS_TOKEN'],
    credentialFiles: []
  },
  {
    id: 'shopify_admin',
    label: 'Shopify Admin',
    env: ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_ADMIN_API_TOKEN', 'SHOPIFY_API_VERSION'],
    credentialFiles: []
  },
  {
    id: 'google_analytics',
    label: 'Google Analytics',
    env: ['GOOGLE_ANALYTICS_PROPERTY_ID', 'GA_PROPERTY_ID', 'GA_MEASUREMENT_ID', 'GA_API_SECRET'],
    credentialFiles: ['GOOGLE_ANALYTICS_CREDENTIALS_PATH', 'GA_SERVICE_ACCOUNT_JSON']
  },
  {
    id: 'google_merchant_center',
    label: 'Google Merchant Center',
    env: ['GOOGLE_MERCHANT_ACCOUNT_ID', 'GOOGLE_MERCHANT_QUOTA_PROJECT', 'GOOGLE_CLOUD_QUOTA_PROJECT', 'GOOGLE_MERCHANT_DATA_SOURCE_ID'],
    credentialFiles: ['MERCHANT_CENTER_CREDENTIALS_PATH']
  },
  {
    id: 'google_ads',
    label: 'Google Ads',
    env: [
      'GOOGLE_ADS_CUSTOMER_ID',
      'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_ACCESS_TOKEN',
      'GOOGLE_ADS_OAUTH_ACCESS_TOKEN',
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_SERVICE_ACCOUNT_JSON',
      'GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON',
      'GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON',
      'GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON',
      'GOOGLE_ADS_API_VERSION'
    ],
    credentialFiles: ['GOOGLE_ADS_SERVICE_ACCOUNT_JSON']
  },
  {
    id: 'google_tag_manager',
    label: 'Google Tag Manager',
    env: ['GTM_CLIENT_ID', 'GTM_CLIENT_SECRET', 'GTM_PROJECT_ID', 'GTM_ACCESS_TOKEN', 'GOOGLE_TAG_MANAGER_ACCESS_TOKEN', 'GTM_SERVICE_ACCOUT', 'GTM_SERVICE_ACCOUNT', 'GTM_SERVICE_ACCOUNT_JSON_PATH', 'GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON', 'GTM_ACCOUNT_ID', 'GTM_CONTAINER_ID', 'GTM_WORKSPACE_ID', 'GTM_WEB_ACCOUNT_ID', 'GTM_WEB_CONTAINER_ID', 'GTM_WEB_WORKSPACE_ID', 'GTM_SERVER_ACCOUNT_ID', 'GTM_SERVER_CONTAINER_ID', 'GTM_SERVER_WORKSPACE_ID', 'NEXT_PUBLIC_GOOGLE_GTM_ID'],
    credentialFiles: ['GTM_SERVICE_ACCOUT', 'GTM_SERVICE_ACCOUNT', 'GTM_SERVICE_ACCOUNT_JSON_PATH', 'GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON']
  },
  {
    id: 'meta',
    label: 'Meta',
    env: ['META_ACCESS_TOKEN', 'META_SYSTEM_USER_TOKEN', 'META_APP_ID', 'META_BUSINESS_ID', 'META_PIXEL_ID', 'NEXT_PUBLIC_META_PIXEL_ID', 'META_AD_ACCOUNT_ID'],
    credentialFiles: []
  },
  {
    id: 'microsoft_uet',
    label: 'Microsoft UET',
    env: ['NEXT_PUBLIC_MICROSOFT_UET_TAG_ID', 'MICROSOFT_UET_TAG_ID', 'UTEKOS_MICROSOFT_TAG_ID', 'MICROSOFT_UET_CAPI_TOKEN', 'MICROSOFT_UET_CAPI_ACCESS_TOKEN', 'UTEKOS_MICROSOFT_UET_CAPI_TOKEN', 'MICROSOFT_ADS_UET_CAPI_TOKEN', 'MICROSOFT_ADS_DEVELOPER_TOKEN', 'MICROSOFT_ADS_ACCOUNT_ID'],
    credentialFiles: []
  },
  {
    id: 'microsoft_ads',
    label: 'Microsoft Advertising',
    env: [
      'MICROSOFT_ADS_DEVELOPER_TOKEN',
      'MICROSOFT_ADS_CLIENT_ID',
      'MICROSOFT_ADS_CLIENT_SECRET',
      'MICROSOFT_ADS_ACCESS_TOKEN',
      'MICROSOFT_ADS_REFRESH_TOKEN',
      'MICROSOFT_ADS_CUSTOMER_ID',
      'MICROSOFT_ADS_ACCOUNT_ID',
      'MICROSOFT_ADS_ENVIRONMENT',
      'MICROSOFT_MERCHANT_CENTER_STORE_ID'
    ],
    credentialFiles: []
  },
  {
    id: 'microsoft_clarity',
    label: 'Microsoft Clarity',
    env: ['CLARITY_API_TOKEN', 'MICROSOFT_CLARITY_PROJECT_ID', 'NEXT_PUBLIC_CLARITY_PROJECT_ID'],
    credentialFiles: []
  },
  {
    id: 'posthog',
    label: 'PostHog',
    env: ['POSTHOG_ORGANIZATION_ID', 'POSTHOG_PROJECT_ID', 'POSTHOG_PERSONAL_API_KEY', 'POSTHOG_CUSTOM_API_KEY', 'NEXT_PUBLIC_POSTHOG_KEY', 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN', 'NEXT_PUBLIC_POSTHOG_HOST', 'NEXT_PUBLIC_POSTHOG_UI_HOST'],
    credentialFiles: []
  },
  {
    id: 'sentry',
    label: 'Sentry',
    env: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT', 'NEXT_PUBLIC_SENTRY_DSN'],
    credentialFiles: []
  },
  {
    id: 'vercel',
    label: 'Vercel',
    env: ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_ORG_ID', 'VERCEL_TEAM_ID'],
    credentialFiles: []
  }
]

const sourceSchema = z.object({
  path: z.string().optional(),
  url: z.string().optional(),
  type: z.string().optional()
})

const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  category: z.string(),
  retryable: z.boolean(),
  safe_to_retry: z.boolean(),
  user_action_required: z.boolean(),
  suggested_fix: z.string(),
  details_redacted: z.boolean()
})

const permissionsSchema = z.object({
  read_only: z.boolean(),
  network_access: z.boolean(),
  writes_possible: z.boolean(),
  changes_provider_state: z.boolean(),
  secrets_redacted: z.boolean()
})

function envelopeSchema(toolName, dataSchema) {
  return z.object({
    ok: z.boolean(),
    tool: z.literal(toolName),
    profile: z.literal(profile),
    mode: z.literal(mode),
    request_id: z.string(),
    started_at: z.string(),
    finished_at: z.string(),
    duration_ms: z.number().nonnegative(),
    data: dataSchema,
    sources: z.array(sourceSchema),
    warnings: z.array(z.string()),
    errors: z.array(errorSchema),
    limits: z.record(z.string(), z.unknown()),
    permissions: permissionsSchema,
    next: z.array(z.string())
  })
}

function nowIso() {
  return new Date().toISOString()
}

function createEnvelope(toolName, startedAt, data, options = {}) {
  const finishedAt = nowIso()
  return {
    ok: options.ok ?? true,
    tool: toolName,
    profile,
    mode,
    request_id: options.requestId ?? randomUUID(),
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: Date.parse(finishedAt) - Date.parse(startedAt),
    data,
    sources: options.sources ?? [],
    warnings: options.warnings ?? [],
    errors: options.errors ?? [],
    limits: options.limits ?? {},
    permissions: {
      read_only: true,
      network_access: options.networkAccess ?? false,
      writes_possible: false,
      changes_provider_state: false,
      secrets_redacted: true
    },
    next: options.next ?? []
  }
}

function makeError(code, message, suggestedFix, category = 'commerce_tracking') {
  return {
    code,
    message,
    category,
    retryable: false,
    safe_to_retry: true,
    user_action_required: false,
    suggested_fix: suggestedFix,
    details_redacted: true
  }
}

function textResult(envelope, summary) {
  return {
    content: [{ type: 'text', text: summary ?? JSON.stringify(envelope, null, 2) }],
    structuredContent: envelope
  }
}

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath)
}

function fileExists(relativePath) {
  return fs.existsSync(repoPath(relativePath))
}

function readText(relativePath) {
  const fullPath = repoPath(relativePath)
  if (!fs.existsSync(fullPath)) return ''
  return fs.readFileSync(fullPath, 'utf8')
}

function parseEnvKeys(relativePath) {
  const fullPath = repoPath(relativePath)
  if (!fs.existsSync(fullPath)) return new Map()
  const keys = new Map()
  const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    keys.set(match[1], match[2].trim().length > 0)
  }

  return keys
}

function readEnvValues(relativePath) {
  const fullPath = repoPath(relativePath)
  if (!fs.existsSync(fullPath)) return new Map()
  const values = new Map()
  const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    const rawValue = match[2].trim()
    const value =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'")) ?
        rawValue.slice(1, -1)
      : rawValue
    values.set(match[1], value)
  }

  return values
}

function secretEnvValue(key) {
  if (process.env[key]) return process.env[key]
  for (const file of ['.env.mcp.local', '.env.local']) {
    const values = readEnvValues(file)
    const value = values.get(key)
    if (value) return value
  }
  return ''
}

function readCredentialCandidate(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('{')) return trimmed
  const fullPath = path.isAbsolute(trimmed) ? trimmed : repoPath(trimmed)
  if (!fs.existsSync(fullPath)) return ''
  return fs.readFileSync(fullPath, 'utf8')
}

function credentialJsonFor(keys, defaultPaths = []) {
  const candidates = [
    ...keys.map(secretEnvValue),
    ...defaultPaths.map(defaultPath => (fileExists(defaultPath) ? readText(defaultPath) : ''))
  ].filter(Boolean)
  let lastError = null

  for (const candidate of candidates) {
    try {
      const credentialCandidate = readCredentialCandidate(candidate)
      if (!credentialCandidate) continue
      const parsed = JSON.parse(credentialCandidate)
      if (parsed && typeof parsed.client_email === 'string' && typeof parsed.private_key === 'string') {
        return {
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, '\n'),
          projectId: typeof parsed.project_id === 'string' ? parsed.project_id : undefined
        }
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    throw lastError
  }

  throw new Error(`Missing service account credentials for ${keys.join(', ')}`)
}

function mapEventCounts(rows) {
  const counts = {}
  for (const row of rows ?? []) {
    const eventName = row.dimensionValues?.[0]?.value
    const eventCount = Number(row.metricValues?.[0]?.value ?? 0)
    if (eventName && Number.isFinite(eventCount)) counts[eventName] = eventCount
  }
  return counts
}

function mapExpectedEventCoverage(counts) {
  return expectedCommerceEvents.map(eventName => ({
    event_name: eventName,
    event_count: counts[eventName] ?? 0,
    observed: (counts[eventName] ?? 0) > 0
  }))
}

async function googleMerchantRequest({ path: requestPath, searchParams, serviceAccount, quotaProject }) {
  const url = new URL(`https://merchantapi.googleapis.com${requestPath}`)
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  const auth = new GoogleAuth({
    credentials: {
      client_email: serviceAccount.clientEmail,
      private_key: serviceAccount.privateKey
    },
    scopes: ['https://www.googleapis.com/auth/content'],
    ...(serviceAccount.projectId ? { projectId: serviceAccount.projectId } : {})
  })
  const client = await auth.getClient()
  const authHeaders = await client.getRequestHeaders(url.toString())
  const headers = new Headers(authHeaders)
  headers.set('x-goog-user-project', quotaProject)
  const response = await fetch(url, {
    headers,
    method: 'GET',
    cache: 'no-store'
  })
  const responseText = await response.text()
  const body = responseText ? JSON.parse(responseText) : null

  return {
    ok: response.ok,
    status: response.status,
    body
  }
}

function normalizeGoogleAdsCustomerId(value) {
  return value.trim().replaceAll('-', '')
}

function googleAdsApiVersion() {
  const rawVersion = secretEnvValue('GOOGLE_ADS_API_VERSION') || 'v24'
  const trimmed = rawVersion.trim()
  if (!trimmed) return 'v24'
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`
}

function googleAdsCredentialMode() {
  if (secretEnvValue('GOOGLE_ADS_ACCESS_TOKEN') || secretEnvValue('GOOGLE_ADS_OAUTH_ACCESS_TOKEN')) return 'access_token'
  if (
    secretEnvValue('GOOGLE_ADS_CLIENT_ID')
    && secretEnvValue('GOOGLE_ADS_CLIENT_SECRET')
    && secretEnvValue('GOOGLE_ADS_REFRESH_TOKEN')
  ) {
    return 'refresh_token'
  }
  if (
    secretEnvValue('GOOGLE_ADS_SERVICE_ACCOUNT_JSON')
    || secretEnvValue('GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON')
    || secretEnvValue('GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON')
    || secretEnvValue('GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON')
    || fileExists('src/api/lib/cloud-credentials/google-ads-service-account.json')
    || fileExists('src/api/lib/cloud-credentials/tag-manager-credentials.json')
  ) {
    return 'service_account'
  }
  return 'missing'
}

function googleAdsConfig() {
  const rawCustomerId = secretEnvValue('GOOGLE_ADS_CUSTOMER_ID')
  const rawLoginCustomerId = secretEnvValue('GOOGLE_ADS_LOGIN_CUSTOMER_ID')

  return {
    apiVersion: googleAdsApiVersion(),
    customerId: rawCustomerId ? normalizeGoogleAdsCustomerId(rawCustomerId) : '',
    loginCustomerId: rawLoginCustomerId ? normalizeGoogleAdsCustomerId(rawLoginCustomerId) : '',
    developerToken: secretEnvValue('GOOGLE_ADS_DEVELOPER_TOKEN'),
    clientId: secretEnvValue('GOOGLE_ADS_CLIENT_ID'),
    clientSecret: secretEnvValue('GOOGLE_ADS_CLIENT_SECRET'),
    refreshToken: secretEnvValue('GOOGLE_ADS_REFRESH_TOKEN'),
    credentialMode: googleAdsCredentialMode()
  }
}

async function googleAdsAccessToken() {
  const explicitToken = secretEnvValue('GOOGLE_ADS_ACCESS_TOKEN') || secretEnvValue('GOOGLE_ADS_OAUTH_ACCESS_TOKEN')
  if (explicitToken) return explicitToken

  const config = googleAdsConfig()
  if (config.clientId && config.clientSecret && config.refreshToken) {
    const response = await readJsonEndpoint(googleOAuthTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: 'refresh_token',
        scope: googleAdsOAuthScope
      })
    })

    if (!response.ok || typeof response.body?.access_token !== 'string') {
      throw new Error(response.body?.error_description || response.body?.error || 'Google OAuth refresh-token exchange failed.')
    }

    return response.body.access_token
  }

  const serviceAccount = credentialJsonFor(
    [
      'GOOGLE_ADS_SERVICE_ACCOUNT_JSON',
      'GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON',
      'GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON',
      'GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON'
    ],
    [
      'src/api/lib/cloud-credentials/google-ads-service-account.json',
      'src/api/lib/cloud-credentials/tag-manager-credentials.json'
    ]
  )
  const auth = new GoogleAuth({
    credentials: {
      client_email: serviceAccount.clientEmail,
      private_key: serviceAccount.privateKey
    },
    scopes: ['https://www.googleapis.com/auth/adwords'],
    ...(serviceAccount.projectId ? { projectId: serviceAccount.projectId } : {})
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return typeof token === 'string' ? token : token?.token ?? ''
}

async function googleAdsRequest({ path: requestPath, method = 'GET', body }) {
  const config = googleAdsConfig()
  const accessToken = await googleAdsAccessToken()
  if (!config.developerToken) throw new Error('Missing GOOGLE_ADS_DEVELOPER_TOKEN.')
  if (!accessToken) throw new Error('Missing Google Ads OAuth access token.')

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'developer-token': config.developerToken
  }
  if (config.loginCustomerId) headers['login-customer-id'] = config.loginCustomerId

  return readJsonEndpoint(`https://googleads.googleapis.com/${config.apiVersion}${requestPath}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  })
}

async function safeGoogleAdsRequest(request) {
  try {
    return await googleAdsRequest(request)
  } catch (error) {
    return {
      ok: false,
      status: null,
      body: {
        error: {
          message: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }
}

async function googleAdsSearch(query) {
  const config = googleAdsConfig()
  if (!config.customerId) {
    return {
      ok: false,
      status: null,
      body: {
        error: {
          message: 'Missing GOOGLE_ADS_CUSTOMER_ID.'
        }
      }
    }
  }

  return safeGoogleAdsRequest({
    path: `/customers/${encodeURIComponent(config.customerId)}/googleAds:search`,
    method: 'POST',
    body: { query }
  })
}

function envPresence() {
  const files = ['.env.mcp.local', '.env.local', '.env.tunnel.local']
  const maps = files.map(file => ({ file, exists: fileExists(file), keys: parseEnvKeys(file) }))
  const env = new Map()

  for (const item of maps) {
    for (const [key, hasValue] of item.keys.entries()) {
      if (!env.has(key)) env.set(key, { present: hasValue, sources: [] })
      const current = env.get(key)
      current.present = current.present || hasValue
      current.sources.push(item.file)
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!env.has(key)) env.set(key, { present: Boolean(value), sources: ['process.env'] })
    else if (value) env.get(key).present = true
  }

  return { files, maps, env }
}

function envRequirementStatus(presence, requirements) {
  return requirements.map(requirement => {
    const alternatives = requirement
      .split('|')
      .map(item => item.trim())
      .filter(Boolean)
    const alternativeGroups = alternatives.map(alternative =>
      alternative
        .split('+')
        .map(item => item.trim())
        .filter(Boolean)
    )
    const presentAlternatives = alternativeGroups
      .filter(group => group.every(key => presence.env.get(key)?.present))
      .map(group => group.join('+'))
    const missingAlternatives = alternativeGroups
      .filter(group => !group.every(key => presence.env.get(key)?.present))
      .map(group => group.filter(key => !presence.env.get(key)?.present).join('+'))

    return {
      requirement,
      satisfied: presentAlternatives.length > 0,
      present_alternatives: presentAlternatives,
      missing_alternatives: missingAlternatives
    }
  })
}

function providerRemediationRow(presence, row) {
  return {
    provider: row.provider,
    label: row.label,
    status: row.status,
    evidence_tool: row.evidenceTool,
    evidence_summary: row.evidenceSummary,
    env_requirements: envRequirementStatus(presence, row.envRequirements),
    external_actions: row.externalActions,
    verification_command: row.verificationCommand,
    rerun_tools: row.rerunTools,
    docs: row.docs
  }
}

function credentialManifest() {
  const manifestPath = 'config/mcp/credentials.manifest.json'
  if (!fileExists(manifestPath)) return { credentialFiles: {} }
  return JSON.parse(readText(manifestPath))
}

function extractEnumValues(source, enumName) {
  const enumMatch = source.match(new RegExp(`${enumName}[\\s\\S]*?z\\.enum\\(\\[([\\s\\S]*?)\\]\\)`))
  if (!enumMatch) return []
  return [...enumMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1])
}

const providerStatusSchema = z.object({
  id: z.string(),
  label: z.string(),
  env: z.array(
    z.object({
      key: z.string(),
      present: z.boolean(),
      sources: z.array(z.string())
    })
  ),
  credential_files: z.array(
    z.object({
      key: z.string(),
      path: z.string(),
      exists: z.boolean(),
      required: z.boolean()
    })
  ),
  live_readiness: z.enum(['ready', 'partial', 'missing_credentials'])
})

const bootstrapDataSchema = z.object({
  profile: z.string(),
  mode: z.string(),
  repo_root: z.string(),
  read_first: z.array(z.string()),
  canonical_tools: z.array(z.string()),
  domains: z.array(z.string()),
  policy: z.object({
    read_only: z.boolean(),
    provider_mutation: z.literal('forbidden'),
    deploy_or_publish: z.literal('requires_explicit_user_confirmation'),
    secrets: z.literal('presence-only')
  }),
  recommended_flow: z.array(z.string())
})

const readinessDataSchema = z.object({
  env_files: z.array(
    z.object({
      path: z.string(),
      exists: z.boolean()
    })
  ),
  providers: z.array(providerStatusSchema)
})

const providerAccessRemediationDataSchema = z.object({
  generated_from: z.array(z.string()),
  summary: z.object({
    providers_total: z.number().int().nonnegative(),
    verified_live: z.array(z.string()),
    fail_closed: z.array(z.string()),
    missing_or_invalid_access: z.array(z.string()),
    next_priority: z.array(z.string())
  }),
  remediations: z.array(
    z.object({
      provider: z.string(),
      label: z.string(),
      status: z.enum([
        'verified_live',
        'implemented_fail_closed',
        'implemented_config_missing',
        'implemented_permission_denied',
        'implemented_invalid_token',
        'implemented_partial_api_failure'
      ]),
      evidence_tool: z.string(),
      evidence_summary: z.string(),
      env_requirements: z.array(
        z.object({
          requirement: z.string(),
          satisfied: z.boolean(),
          present_alternatives: z.array(z.string()),
          missing_alternatives: z.array(z.string())
        })
      ),
      external_actions: z.array(z.string()),
      verification_command: z.string(),
      rerun_tools: z.array(z.string()),
      docs: z.array(
        z.object({
          label: z.string(),
          path: z.string().optional(),
          url: z.string().optional()
        })
      )
    })
  )
})

const shopifyVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable(),
  available_for_sale: z.boolean(),
  currently_not_in_stock: z.boolean().nullable(),
  quantity_available: z.number().int().nullable(),
  price_amount: z.string(),
  currency_code: z.string(),
  selected_options: z.array(
    z.object({
      name: z.string(),
      value: z.string()
    })
  )
})

const shopifyProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  available_for_sale: z.boolean(),
  variants: z.array(shopifyVariantSchema)
})

const shopifyAdminVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable(),
  inventory_quantity: z.number().int().nullable(),
  price: z.string().nullable()
})

const shopifyAdminProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  status: z.string(),
  total_inventory: z.number().int().nullable(),
  variants: z.array(shopifyAdminVariantSchema)
})

const shopifyAdminCatalogProbeDataSchema = z.object({
  store_domain: z.string().nullable(),
  api_version: z.string(),
  shop: z.object({
    name: z.string().nullable(),
    myshopify_domain: z.string().nullable(),
    primary_domain_url: z.string().nullable(),
    plan_display_name: z.string().nullable()
  }),
  products: z.array(shopifyAdminProductSchema),
  graphql_errors: z.array(z.string()),
  http_status: z.number().int().nullable()
})

const shopifyStorefrontProbeDataSchema = z.object({
  store_domain: z.string().nullable(),
  api_version: z.string(),
  query_mode: z.enum(['handle', 'available_products']),
  requested_handle: z.string().nullable(),
  products: z.array(shopifyProductSchema),
  graphql_errors: z.array(z.string()),
  http_status: z.number().int().nullable()
})

const ga4CoverageSchema = z.object({
  event_name: z.string(),
  event_count: z.number(),
  observed: z.boolean()
})

const ga4EventStatusDataSchema = z.object({
  property_id: z.string().nullable(),
  realtime: z.object({
    counts: z.record(z.string(), z.number()),
    expected_events: z.array(ga4CoverageSchema)
  }),
  report: z.object({
    date_range: z.object({
      start_date: z.string(),
      end_date: z.string()
    }),
    counts: z.record(z.string(), z.number()),
    expected_events: z.array(ga4CoverageSchema)
  })
})

const merchantCenterStatusDataSchema = z.object({
  account_id: z.string().nullable(),
  quota_project: z.string().nullable(),
  api: z.object({
    data_sources: z.object({ ok: z.boolean(), status: z.number().int().nullable(), count: z.number().int().nonnegative() }),
    account_issues: z.object({ ok: z.boolean(), status: z.number().int().nullable(), count: z.number().int().nonnegative() }),
    aggregate_product_statuses: z.object({ ok: z.boolean(), status: z.number().int().nullable(), count: z.number().int().nonnegative() }),
    products: z.object({ ok: z.boolean(), status: z.number().int().nullable(), count: z.number().int().nonnegative() })
  }),
  data_sources: z.array(
    z.object({
      name: z.string().optional(),
      display_name: z.string().optional(),
      input: z.string().optional(),
      primary_product_data_source: z.boolean()
    })
  ),
  account_issues: z.array(
    z.object({
      name: z.string().optional(),
      title: z.string().optional(),
      severity: z.string().optional()
    })
  ),
  aggregate_product_statuses: z.array(
    z.object({
      name: z.string().optional(),
      reporting_context: z.string().optional(),
      status: z.string().optional(),
      issues_count: z.number().int().nonnegative()
    })
  ),
  products: z.array(
    z.object({
      name: z.string().optional(),
      offer_id: z.string().optional(),
      content_language: z.string().optional(),
      feed_label: z.string().optional(),
      issues_count: z.number().int().nonnegative()
    })
  )
})

const googleAdsMetricsSchema = z.object({
  clicks: z.number(),
  impressions: z.number(),
  ctr: z.number(),
  average_cpc_micros: z.number(),
  cost_micros: z.number(),
  conversions: z.number(),
  conversions_value: z.number(),
  all_conversions: z.number(),
  all_conversions_value: z.number()
})

const googleAdsAccountAccessDataSchema = z.object({
  api_version: z.string(),
  customer_id: z.string().nullable(),
  login_customer_id: z.string().nullable(),
  credential_mode: z.enum(['access_token', 'service_account', 'missing']),
  http_status: z.number().int().nullable(),
  accessible_customer_count: z.number().int().nonnegative(),
  accessible_customers: z.array(z.string()),
  configured_customer_accessible: z.boolean().nullable()
})

const googleAdsCampaignPerformanceDataSchema = z.object({
  api_version: z.string(),
  customer_id: z.string().nullable(),
  login_customer_id: z.string().nullable(),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string()
  }),
  http_status: z.number().int().nullable(),
  campaign_count: z.number().int().nonnegative(),
  campaigns: z.array(
    z.object({
      campaign_id: z.string().nullable(),
      name: z.string().nullable(),
      status: z.string().nullable(),
      advertising_channel_type: z.string().nullable(),
      bidding_strategy_type: z.string().nullable(),
      optimization_score: z.number().nullable(),
      budget_amount_micros: z.number().nullable(),
      date: z.string().nullable(),
      metrics: googleAdsMetricsSchema
    })
  )
})

const googleAdsConversionActionDataSchema = z.object({
  api_version: z.string(),
  customer_id: z.string().nullable(),
  login_customer_id: z.string().nullable(),
  http_status: z.number().int().nullable(),
  conversion_action_count: z.number().int().nonnegative(),
  conversion_actions: z.array(
    z.object({
      id: z.string().nullable(),
      name: z.string().nullable(),
      status: z.string().nullable(),
      type: z.string().nullable(),
      category: z.string().nullable(),
      origin: z.string().nullable(),
      primary_for_goal: z.boolean().nullable(),
      include_in_conversions_metric: z.boolean().nullable(),
      owner_customer: z.string().nullable(),
      last_conversion_date: z.string().nullable(),
      last_received_request_date_time: z.string().nullable()
    })
  )
})

const googleAdsSearchTermsDataSchema = z.object({
  api_version: z.string(),
  customer_id: z.string().nullable(),
  login_customer_id: z.string().nullable(),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string()
  }),
  http_status: z.number().int().nullable(),
  search_term_count: z.number().int().nonnegative(),
  search_terms: z.array(
    z.object({
      search_term: z.string().nullable(),
      status: z.string().nullable(),
      campaign_id: z.string().nullable(),
      campaign_name: z.string().nullable(),
      ad_group_id: z.string().nullable(),
      ad_group_name: z.string().nullable(),
      date: z.string().nullable(),
      metrics: googleAdsMetricsSchema
    })
  )
})

const posthogEventStatusDataSchema = z.object({
  host: z.string().nullable(),
  project_id: z.string().nullable(),
  date_range: z.object({
    days_back: z.number().int().positive()
  }),
  query_kind: z.literal('HogQLQuery'),
  events: z.array(
    z.object({
      event_name: z.string(),
      event_count: z.number()
    })
  ),
  expected_events: z.array(ga4CoverageSchema)
})

const posthogProjectDiscoveryDataSchema = z.object({
  host: z.string().nullable(),
  organization_id: z.string().nullable(),
  http_status: z.number().int().nullable(),
  project_count: z.number().int().nonnegative(),
  projects: z.array(
    z.object({
      id: z.number().int().nullable(),
      project_id: z.number().int().nullable(),
      uuid: z.string().nullable(),
      name: z.string().nullable(),
      timezone: z.string().nullable(),
      ingested_event: z.boolean().nullable(),
      access_control: z.boolean().nullable(),
      app_urls: z.array(z.string())
    })
  )
})

const sentryIssueStatusDataSchema = z.object({
  organization: z.string().nullable(),
  project: z.string().nullable(),
  query: z.string(),
  stats_period: z.string(),
  http_status: z.number().int().nullable(),
  issue_count: z.number().int().nonnegative(),
  issues: z.array(
    z.object({
      id: z.string().optional(),
      short_id: z.string().optional(),
      title: z.string().optional(),
      culprit: z.string().optional(),
      level: z.string().optional(),
      status: z.string().optional(),
      count: z.string().optional(),
      user_count: z.number().int().nonnegative().optional(),
      first_seen: z.string().optional(),
      last_seen: z.string().optional(),
      permalink: z.string().optional()
    })
  )
})

const vercelDeploymentStatusDataSchema = z.object({
  project_id: z.string().nullable(),
  team_id: z.string().nullable(),
  http_status: z.number().int().nullable(),
  deployment_count: z.number().int().nonnegative(),
  deployments: z.array(
    z.object({
      uid: z.string().optional(),
      name: z.string().optional(),
      url: z.string().optional().nullable(),
      state: z.string().optional(),
      target: z.string().optional().nullable(),
      created_at: z.number().optional(),
      ready_at: z.number().optional().nullable(),
      creator: z.string().optional().nullable(),
      git_branch: z.string().optional().nullable(),
      git_commit_sha: z.string().optional().nullable(),
      git_commit_message: z.string().optional().nullable()
    })
  )
})

const endpointProbeSchema = z.object({
  label: z.string(),
  url: z.string(),
  ok: z.boolean(),
  status: z.number().int().nullable(),
  content_type: z.string().nullable()
})

const gtmSgtmEndpointStatusDataSchema = z.object({
  origin: z.string(),
  gtm_id: z.string(),
  canonical_google_tag_id: z.string(),
  endpoints: z.array(endpointProbeSchema)
})

const metaDatasetQualityDataSchema = z.object({
  pixel_id: z.string().nullable(),
  graph_version: z.string(),
  http_status: z.number().int().nullable(),
  event_count: z.number().int().nonnegative(),
  events: z.array(
    z.object({
      event_name: z.string().optional(),
      event_match_quality_score: z.number().nullable(),
      event_coverage_percentage: z.number().nullable(),
      dedupe_feedback_present: z.boolean(),
      data_freshness_present: z.boolean(),
      diagnostics_count: z.number().int().nonnegative()
    })
  )
})

const microsoftUetEndpointStatusDataSchema = z.object({
  tag_id: z.string().nullable(),
  endpoints: z.array(endpointProbeSchema)
})

const microsoftAdsAuthReadinessDataSchema = z.object({
  environment: z.string(),
  oauth_scope_required: z.literal('msads.manage'),
  developer_token_present: z.boolean(),
  client_id_present: z.boolean(),
  client_secret_present: z.boolean(),
  access_token_present: z.boolean(),
  refresh_token_present: z.boolean(),
  customer_id: z.string().nullable(),
  account_id: z.string().nullable(),
  parsed_access_token: z.object({
    inspectable: z.boolean(),
    scope_present: z.boolean().nullable(),
    expires_at: z.string().nullable(),
    tenant: z.string().nullable()
  }),
  missing_requirements: z.array(z.string())
})

const microsoftAdsReadProbeDataSchema = z.object({
  environment: z.string(),
  customer_id: z.string().nullable(),
  account_id: z.string().nullable(),
  endpoint: z.string(),
  http_status: z.number().int().nullable(),
  auth_ready: z.boolean(),
  verified: z.boolean(),
  response_summary: z.object({
    body_present: z.boolean(),
    fault_code: z.string().nullable(),
    fault_message: z.string().nullable(),
    item_count: z.number().int().nonnegative().nullable()
  }),
  missing_requirements: z.array(z.string())
})

const microsoftAdsSurfaceProbeDataSchema = z.object({
  environment: z.string(),
  customer_id: z.string().nullable(),
  account_id: z.string().nullable(),
  surface: z.enum(['campaign_status', 'ad_insight', 'shopping_content']),
  endpoint: z.string(),
  http_status: z.number().int().nullable(),
  auth_ready: z.boolean(),
  verified: z.boolean(),
  supported_reads: z.array(z.string()),
  response_summary: z.object({
    body_present: z.boolean(),
    fault_code: z.string().nullable(),
    fault_message: z.string().nullable(),
    item_count: z.number().int().nonnegative().nullable()
  }),
  missing_requirements: z.array(z.string())
})

const microsoftClarityAdsStatusDataSchema = z.object({
  clarity_project_id: z.string().nullable(),
  clarity_api_token_present: z.boolean(),
  uet_tag_id: z.string().nullable(),
  uet_clarity_linkage_required: z.boolean(),
  advertising_dashboard_required: z.boolean(),
  consent_api_v2_required: z.boolean(),
  consent_storage_flags: z.array(z.literal('ad_Storage').or(z.literal('analytics_Storage'))),
  status: z.enum(['ready_for_live_probe', 'implemented_config_missing']),
  missing_requirements: z.array(z.string())
})

const gtmApiWorkspaceDataSchema = z.object({
  account_id: z.string().nullable(),
  container_id: z.string().nullable(),
  workspace_id: z.string().nullable(),
  public_container_id: z.string().nullable(),
  http_status: z.number().int().nullable(),
  workspaces: z.array(
    z.object({
      path: z.string().optional(),
      account_id: z.string().optional(),
      container_id: z.string().optional(),
      workspace_id: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      fingerprint: z.string().optional()
    })
  )
})

const architectureDataSchema = z.object({
  endpoints: z.array(
    z.object({
      route: z.string(),
      path: z.string(),
      exists: z.boolean(),
      purpose: z.string()
    })
  ),
  provider_adapters: z.array(
    z.object({
      provider: z.string(),
      paths: z.array(z.string()),
      present: z.boolean()
    })
  ),
  consent_sources: z.array(
    z.object({
      path: z.string(),
      exists: z.boolean(),
      purpose: z.string()
    })
  ),
  observability_sources: z.array(
    z.object({
      path: z.string(),
      exists: z.boolean(),
      purpose: z.string()
    })
  )
})

const eventContractDataSchema = z.object({
  schema_path: z.string(),
  route_path: z.string(),
  canonical_event_names: z.array(z.string()),
  provider_event_names: z.array(z.string()),
  required_fields: z.array(z.string()),
  consent_gates: z.array(z.string()),
  dispatch_providers: z.array(z.string())
})

const docsMapDataSchema = z.object({
  docs: z.array(
    z.object({
      domain: z.string(),
      paths: z.array(z.string())
    })
  ),
  source_files: z.array(
    z.object({
      domain: z.string(),
      paths: z.array(z.string())
    })
  )
})

const inspectAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true
}

const liveReadAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: true,
  idempotentHint: true
}

const server = new McpServer({
  name: 'utekos-commerce-tracking',
  version: '1.0.0'
})

server.registerTool(
  'commerce_tracking_bootstrap',
  {
    title: 'Commerce Tracking Bootstrap',
    description: 'Use this first in Utekos Commerce/Tracking sessions. Returns the read-only policy, domain scope, canonical tools, and verification flow.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('commerce_tracking_bootstrap', bootstrapDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const data = {
      profile,
      mode,
      repo_root: repoRoot,
      read_first: readFirst,
      canonical_tools: canonicalTools,
      domains: ['shopify', 'merchant-center', 'google-ads', 'microsoft-ads', 'microsoft-shopping', 'microsoft-clarity', 'tracking-events', 'consent', 'ga4', 'gtm', 'meta', 'microsoft-uet', 'posthog', 'sentry', 'vercel'],
      policy: {
        read_only: true,
        provider_mutation: 'forbidden',
        deploy_or_publish: 'requires_explicit_user_confirmation',
        secrets: 'presence-only'
      },
      recommended_flow: [
        'commerce_tracking_bootstrap',
        'provider_env_readiness',
        'provider_access_remediation_report',
        'shopify_admin_catalog_probe',
        'shopify_storefront_product_probe',
        'ga4_event_status_probe',
        'merchant_center_status_probe',
        'google_ads_account_access_probe',
        'google_ads_campaign_performance_probe',
        'google_ads_conversion_action_probe',
        'google_ads_search_terms_probe',
        'posthog_project_discovery_probe',
        'posthog_event_status_probe',
        'sentry_issue_status_probe',
        'vercel_deployment_status_probe',
        'gtm_sgtm_endpoint_status_probe',
        'meta_dataset_quality_probe',
        'microsoft_uet_endpoint_status_probe',
        'microsoft_ads_auth_readiness_probe',
        'microsoft_ads_account_access_probe',
        'microsoft_ads_campaign_status_probe',
        'microsoft_ads_ad_insight_probe',
        'microsoft_shopping_content_status_probe',
        'microsoft_clarity_ads_status_probe',
        'gtm_api_workspace_probe',
        'tracking_architecture_inventory',
        'tracking_event_contract',
        'commerce_tracking_docs_map'
      ]
    }

    return textResult(
      createEnvelope('commerce_tracking_bootstrap', startedAt, data, {
        sources: readFirst.map(item => ({ path: item, type: 'read-first' })),
        next: ['Call provider_env_readiness before claiming live-provider coverage.']
      }),
      'Commerce/Tracking diagnostics ready in read-only mode.'
    )
  }
)

server.registerTool(
  'provider_access_remediation_report',
  {
    title: 'Provider Access Remediation Report',
    description: 'Return an agent-readable remediation plan for every Commerce/Tracking provider whose live read surface is missing credentials, IAM scopes, project ids, or valid provider access. Secret values are never returned.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('provider_access_remediation_report', providerAccessRemediationDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const presence = envPresence()
    const remediations = [
      providerRemediationRow(presence, {
        provider: 'shopify_admin',
        label: 'Shopify Admin',
        status: 'verified_live',
        evidenceTool: 'shopify_admin_catalog_probe',
        evidenceSummary: 'Live bounded Admin GraphQL catalog read is verified in the local doctor.',
        envRequirements: ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_ADMIN_API_TOKEN', 'SHOPIFY_API_VERSION'],
        externalActions: ['Keep Admin token read-only for diagnostics; do not expose customer/order data through this bridge.'],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['shopify_admin_catalog_probe'],
        docs: [
          { label: 'Shopify Admin GraphQL', url: 'https://shopify.dev/docs/api/admin-graphql/latest' },
          { label: 'Local Admin reference', path: 'src/lib/shopify/admin.ts' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'shopify_storefront',
        label: 'Shopify Storefront',
        status: 'verified_live',
        evidenceTool: 'shopify_storefront_product_probe',
        evidenceSummary: 'Live bounded Storefront GraphQL product/variant/SKU read is verified in the local doctor.',
        envRequirements: ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'SHOPIFY_API_VERSION'],
        externalActions: ['Keep Storefront token available for product smoke tests and inventory/availability diagnostics.'],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['shopify_storefront_product_probe'],
        docs: [
          { label: 'Shopify Storefront API', url: 'https://shopify.dev/docs/api/storefront/latest' },
          { label: 'Local Shopify config', path: 'src/db/config/shopify.config.ts' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'gtm_sgtm_public',
        label: 'Public sGTM/GTM Endpoints',
        status: 'verified_live',
        evidenceTool: 'gtm_sgtm_endpoint_status_probe',
        evidenceSummary: 'Public first-party sGTM/GTM endpoints are verified reachable with HTTP 200 in the local doctor.',
        envRequirements: ['NEXT_PUBLIC_TRACKING_SGTM_ORIGIN', 'NEXT_PUBLIC_GOOGLE_GTM_ID'],
        externalActions: ['Use browser/network and GTM Preview before claiming tag firing correctness; public endpoint reachability alone is not event verification.'],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['gtm_sgtm_endpoint_status_probe', 'browser_network_requests'],
        docs: [
          { label: 'Local sGTM runbook', path: 'src/lib/tracking/server-side-tagging.md' },
          { label: 'Production tracking verifier', path: 'scripts/tracking/verify-production-tracking.sh' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'microsoft_uet_public',
        label: 'Microsoft UET Public Endpoints',
        status: 'verified_live',
        evidenceTool: 'microsoft_uet_endpoint_status_probe',
        evidenceSummary: 'Public Microsoft UET loader/action endpoints are verified reachable in the local doctor.',
        envRequirements: ['NEXT_PUBLIC_MICROSOFT_UET_TAG_ID|MICROSOFT_UET_TAG_ID|UTEKOS_MICROSOFT_TAG_ID'],
        externalActions: ['Use browser/network and Microsoft Ads dashboard/API before claiming conversion registration.'],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['microsoft_uet_endpoint_status_probe', 'browser_network_requests'],
        docs: [
          { label: 'Local sGTM runbook', path: 'src/lib/tracking/server-side-tagging.md' },
          { label: 'Local UET adapter', path: 'src/lib/tracking/microsoft-uet/trackMicrosoftUetEvent.ts' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'microsoft_ads',
        label: 'Microsoft Advertising Ads API',
        status: 'implemented_config_missing',
        evidenceTool: 'microsoft_ads_account_access_probe',
        evidenceSummary: 'Microsoft Advertising read-only auth, account access, campaign status, and Ad Insight probes are implemented. Live success requires MFA-compliant OAuth with msads.manage, developer token, CustomerId, AccountId, and refresh-token handling.',
        envRequirements: [
          'MICROSOFT_ADS_DEVELOPER_TOKEN',
          'MICROSOFT_ADS_CLIENT_ID',
          'MICROSOFT_ADS_ACCESS_TOKEN',
          'MICROSOFT_ADS_REFRESH_TOKEN',
          'MICROSOFT_ADS_CUSTOMER_ID',
          'MICROSOFT_ADS_ACCOUNT_ID'
        ],
        externalActions: [
          'Complete Microsoft Advertising OAuth through Microsoft identity platform with the msads.manage scope.',
          'Persist refresh-token handling outside generated MCP files.',
          'Verify the user has access to the configured CustomerId and AccountId.',
          'Keep this profile read-only; campaign edits, budget changes, conversion goal changes, and opportunity auto-apply require separate explicit approval.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: [
          'microsoft_ads_auth_readiness_probe',
          'microsoft_ads_account_access_probe',
          'microsoft_ads_campaign_status_probe',
          'microsoft_ads_ad_insight_probe'
        ],
        docs: [
          { label: 'Microsoft OAuth with MFA', url: 'https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-mfa?view=bingads-13' },
          { label: 'Microsoft Advertising get started', url: 'https://learn.microsoft.com/en-us/advertising/guides/get-started?view=bingads-13' },
          { label: 'Local Microsoft Ads docs', path: 'docs/microsoft/advertising-api.md' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'microsoft_shopping',
        label: 'Microsoft Shopping Content API',
        status: 'implemented_config_missing',
        evidenceTool: 'microsoft_shopping_content_status_probe',
        evidenceSummary: 'Microsoft Shopping Content read-only product/status probe is implemented. Live success requires Merchant Center store id plus Ads OAuth/developer token/customer/account access.',
        envRequirements: [
          'MICROSOFT_ADS_DEVELOPER_TOKEN',
          'MICROSOFT_ADS_ACCESS_TOKEN',
          'MICROSOFT_ADS_REFRESH_TOKEN',
          'MICROSOFT_ADS_CUSTOMER_ID',
          'MICROSOFT_ADS_ACCOUNT_ID',
          'MICROSOFT_MERCHANT_CENTER_STORE_ID'
        ],
        externalActions: [
          'Identify the Microsoft Merchant Center store id separately from Ads AccountId.',
          'Verify the OAuth user has store/catalog read access.',
          'Do not mutate store, catalog, product, or feed resources through default diagnostics.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['microsoft_shopping_content_status_probe'],
        docs: [
          { label: 'Microsoft Shopping Content get started', url: 'https://learn.microsoft.com/en-us/advertising/shopping-content/get-started' },
          { label: 'Local Microsoft Ads docs', path: 'docs/microsoft/advertising-api.md' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'microsoft_clarity',
        label: 'Microsoft Clarity Advertising',
        status: 'implemented_config_missing',
        evidenceTool: 'microsoft_clarity_ads_status_probe',
        evidenceSummary: 'Clarity advertising readiness probe is implemented for API token/project id, UET-Clarity linkage requirement, Advertising Dashboard requirement, and Consent API V2 storage flags.',
        envRequirements: ['CLARITY_API_TOKEN', 'MICROSOFT_CLARITY_PROJECT_ID|NEXT_PUBLIC_CLARITY_PROJECT_ID', 'MICROSOFT_UET_TAG_ID|NEXT_PUBLIC_MICROSOFT_UET_TAG_ID'],
        externalActions: [
          'Verify UET-Clarity linkage in Microsoft Clarity.',
          'Verify Advertising Dashboard connection for Microsoft Ads and any Google Ads linkage used for analysis.',
          'Browser-smoke Consent API V2 with ad_Storage and analytics_Storage for each Cookiebot consent state.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['microsoft_clarity_ads_status_probe'],
        docs: [
          { label: 'Clarity Advertising Dashboard', url: 'https://learn.microsoft.com/en-us/clarity/advertising/advertising-dashboard' },
          { label: 'Clarity Consent API V2', url: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2' },
          { label: 'Local Microsoft Ads docs', path: 'docs/microsoft/advertising-api.md' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'ga4',
        label: 'Google Analytics 4',
        status: 'implemented_permission_denied',
        evidenceTool: 'ga4_event_status_probe',
        evidenceSummary: 'Tool is implemented, but the latest live probe fails closed because the service account lacks sufficient access to the configured GA4 property.',
        envRequirements: [
          'GOOGLE_ANALYTICS_PROPERTY_ID|GA_PROPERTY_ID',
          'GOOGLE_ANALYTICS_DATA_API_SERVICE_ACCOUNT_JSON|GA_SERVICE_ACCOUNT_JSON|GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON|MERCHANT_CENTER_CREDENTIALS_PATH'
        ],
        externalActions: [
          'Grant the configured service account Viewer or Analyst access on the GA4 property used by Utekos.',
          'Confirm the property id is the intended production/storefront property, not a stale or wrong environment.',
          'Keep the tool read-only; use it only to read realtime and recent event counts.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['ga4_event_status_probe'],
        docs: [
          { label: 'Google Analytics Data API', url: 'https://developers.google.com/analytics/devguides/reporting/data/v1/rest' },
          { label: 'Local GA status adapter', path: 'src/lib/google/analytics-data/getGoogleAnalyticsEventStatus.ts' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'merchant_center',
        label: 'Google Merchant Center',
        status: 'implemented_partial_api_failure',
        evidenceTool: 'merchant_center_status_probe',
        evidenceSummary: 'Tool is implemented, but the latest live probe returns structured partial API/access failure across Merchant API reads.',
        envRequirements: [
          'GOOGLE_MERCHANT_ACCOUNT_ID',
          'GOOGLE_MERCHANT_QUOTA_PROJECT|GOOGLE_CLOUD_QUOTA_PROJECT',
          'GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON|MERCHANT_CENTER_CREDENTIALS_PATH'
        ],
        externalActions: [
          'Verify Merchant API is enabled for the quota project.',
          'Verify the service account has Merchant Center access to the configured account.',
          'Verify developer registration/API access for Merchant API and the correct account id.',
          'Check data source/product status endpoints after IAM changes propagate.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['merchant_center_status_probe'],
        docs: [
          { label: 'Merchant API products', url: 'https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.products' },
          { label: 'Local Merchant status adapter', path: 'src/lib/google/merchant-center/status/getMerchantCenterStatus.ts' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'google_ads',
        label: 'Google Ads',
        status: 'implemented_config_missing',
        evidenceTool: 'google_ads_account_access_probe',
        evidenceSummary: 'Direct Google Ads REST/GAQL tools are implemented for account access, campaign performance, conversion actions, and search terms. Live success depends on developer token, OAuth/service-account access, and the configured customer id.',
        envRequirements: [
          'GOOGLE_ADS_CUSTOMER_ID',
          'GOOGLE_ADS_DEVELOPER_TOKEN',
          'GOOGLE_ADS_ACCESS_TOKEN|GOOGLE_ADS_OAUTH_ACCESS_TOKEN|GOOGLE_ADS_CLIENT_ID+GOOGLE_ADS_CLIENT_SECRET+GOOGLE_ADS_REFRESH_TOKEN|GOOGLE_ADS_SERVICE_ACCOUNT_JSON|GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON|GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON|GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON',
          'GOOGLE_ADS_LOGIN_CUSTOMER_ID'
        ],
        externalActions: [
          'Verify the Google Ads developer token is approved for the account scope being queried.',
          'Grant the OAuth principal or service account read access to the Google Ads customer or manager account.',
          'Set GOOGLE_ADS_LOGIN_CUSTOMER_ID when querying a client account through a manager account.',
          'Keep this profile read-only; conversion uploads, customer match ingestion, campaign edits, and budget edits remain outside this MCP surface.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: [
          'google_ads_account_access_probe',
          'google_ads_campaign_performance_probe',
          'google_ads_conversion_action_probe',
          'google_ads_search_terms_probe'
        ],
        docs: [
          { label: 'Google Ads REST authentication', url: 'https://developers.google.com/google-ads/api/rest/auth' },
          { label: 'Google Ads REST examples', url: 'https://developers.google.com/google-ads/api/rest/examples' },
          { label: 'Google Ads API first call', url: 'https://developers.google.com/google-ads/api/docs/get-started/make-first-call' },
          { label: 'Local Data Manager config', path: 'src/lib/google/data-manager/dataManagerConfig.ts' },
          { label: 'Local server-side tagging notes', path: 'src/lib/tracking/server-side-tagging.md' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'posthog',
        label: 'PostHog',
        status: 'implemented_config_missing',
        evidenceTool: 'posthog_project_discovery_probe',
        evidenceSummary: 'Project discovery and event-status tools are implemented, but the latest event probe fails closed when project id is not configured even though API/token-style values may be present.',
        envRequirements: ['POSTHOG_PROJECT_ID|POSTHOG_PROJECT', 'POSTHOG_PERSONAL_API_KEY|POSTHOG_CUSTOM_API_KEY|POSTHOG_API_KEY', 'POSTHOG_API_HOST|POSTHOG_HOST|POSTHOG_UI_HOST|NEXT_PUBLIC_POSTHOG_UI_HOST'],
        externalActions: [
          'Copy the numeric PostHog project id from the correct PostHog project settings.',
          'Use a personal/query API key with read/query access for HogQL.',
          'Confirm EU/US host matches the Utekos PostHog project.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['posthog_project_discovery_probe', 'posthog_event_status_probe'],
        docs: [
          { label: 'PostHog Query API', url: 'https://posthog.com/docs/api/query' },
          { label: 'PostHog SQL', url: 'https://posthog.com/docs/sql' },
          { label: 'Local PostHog provider', path: 'src/components/providers/PostHogProvider.tsx' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'sentry',
        label: 'Sentry',
        status: 'implemented_permission_denied',
        evidenceTool: 'sentry_issue_status_probe',
        evidenceSummary: 'Tool is implemented, but the latest probe fails closed with provider permission/scope failure for the configured token/project.',
        envRequirements: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'],
        externalActions: [
          'Verify org slug and project slug are exact.',
          'Use a Sentry token with project issue/event read permissions for the configured project.',
          'Rerun the issue probe before claiming observability coverage.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['sentry_issue_status_probe'],
        docs: [
          { label: 'Sentry project issues API', url: 'https://docs.sentry.io/api/events/list-a-projects-issues/' },
          { label: 'Local tracing docs', path: 'docs/tracing.md' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'vercel',
        label: 'Vercel',
        status: 'implemented_config_missing',
        evidenceTool: 'vercel_deployment_status_probe',
        evidenceSummary: 'Tool is implemented, but the latest probe fails closed because Vercel token/project id configuration is missing.',
        envRequirements: ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_TEAM_ID|VERCEL_ORG_ID'],
        externalActions: [
          'Create or provide a read-capable Vercel token for deployment listing.',
          'Set the Utekos project id and team/org id when the project is owned by a team.',
          'Do not use this diagnostic tool to create deployments; deploy remains an explicit user-confirmed operation.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['vercel_deployment_status_probe'],
        docs: [
          { label: 'Vercel list deployments API', url: 'https://vercel.com/docs/rest-api/deployments/list-deployments' },
          { label: 'Local deploy skill', path: '.agents/skills/deploy-to-vercel/SKILL.md' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'meta',
        label: 'Meta Dataset Quality',
        status: 'implemented_invalid_token',
        evidenceTool: 'meta_dataset_quality_probe',
        evidenceSummary: 'Tool is implemented, but the latest provider response says the configured access token is malformed.',
        envRequirements: ['META_ACCESS_TOKEN|META_SYSTEM_USER_TOKEN|CATALOG_ACCESS_TOKEN', 'META_PIXEL_ID|NEXT_PUBLIC_META_PIXEL_ID'],
        externalActions: [
          'Replace the malformed token with a valid long-lived system user token or appropriate Meta access token.',
          'Verify the token has access to the configured Dataset/Pixel and Dataset Quality read endpoint.',
          'Rotate any token that was pasted into chat or terminal output.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['meta_dataset_quality_probe'],
        docs: [
          { label: 'Local Meta Dataset Quality docs', path: 'docs/meta/dataset-quality-api.md' },
          { label: 'Local Meta quality sync', path: 'src/lib/tracking/meta/insights/syncMetaInsightsAndQuality.ts' }
        ]
      }),
      providerRemediationRow(presence, {
        provider: 'gtm_api',
        label: 'Authenticated Google Tag Manager API',
        status: 'implemented_config_missing',
        evidenceTool: 'gtm_api_workspace_probe',
        evidenceSummary: 'Tool is implemented, but the latest probe fails closed because OAuth access token and numeric GTM account/container ids are missing.',
        envRequirements: ['GTM_ACCESS_TOKEN|GOOGLE_TAG_MANAGER_ACCESS_TOKEN|GTM_SERVICE_ACCOUT|GTM_SERVICE_ACCOUNT|GTM_SERVICE_ACCOUNT_JSON_PATH|GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON', 'GTM_ACCOUNT_ID|GTM_WEB_ACCOUNT_ID', 'GTM_CONTAINER_ID|GTM_WEB_CONTAINER_ID|NEXT_PUBLIC_GOOGLE_GTM_ID', 'GTM_WORKSPACE_ID|GTM_WEB_WORKSPACE_ID'],
        externalActions: [
          'Complete GTM OAuth or provide a short-lived access token with read scope.',
          'Set numeric GTM web account id and container id; public GTM container id alone is not enough for GTM API v2.',
          'Use this read tool only for workspace metadata; preview/publish remains explicit and outside the default profile.'
        ],
        verificationCommand: 'npm run mcp:commerce-tracking:doctor',
        rerunTools: ['gtm_api_workspace_probe'],
        docs: [
          { label: 'GTM API v2', url: 'https://developers.google.com/tag-platform/tag-manager/api/v2' },
          { label: 'GTM workspaces API', url: 'https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces' }
        ]
      })
    ]
    const verifiedLive = remediations.filter(item => item.status === 'verified_live').map(item => item.provider)
    const failClosed = remediations.filter(item => item.status !== 'verified_live').map(item => item.provider)
    const missingOrInvalidAccess = remediations
      .filter(item => item.status !== 'verified_live')
      .filter(item => item.env_requirements.some(requirement => !requirement.satisfied) || ['implemented_permission_denied', 'implemented_invalid_token', 'implemented_partial_api_failure'].includes(item.status))
      .map(item => item.provider)
    const data = {
      generated_from: [
        'config/mcp/README.md',
        'docs/CODEX.md',
        'config/mcp/chatgpt-profiles.json',
        'npm run mcp:commerce-tracking:doctor'
      ],
      summary: {
        providers_total: remediations.length,
        verified_live: verifiedLive,
        fail_closed: failClosed,
        missing_or_invalid_access: missingOrInvalidAccess,
        next_priority: ['google_ads', 'microsoft_ads', 'microsoft_shopping', 'microsoft_clarity', 'ga4', 'posthog', 'gtm_api', 'meta', 'merchant_center', 'sentry', 'vercel']
      },
      remediations
    }

    return textResult(
      createEnvelope('provider_access_remediation_report', startedAt, data, {
        sources: [
          { path: 'config/mcp/README.md', type: 'local-runbook' },
          { path: 'docs/CODEX.md', type: 'local-agent-state' },
          { path: 'config/mcp/chatgpt-profiles.json', type: 'profile-config' },
          { path: 'config/mcp/credentials.manifest.json', type: 'credential-manifest' }
        ],
        next: ['Fix the highest-priority provider access gaps, rerun npm run mcp:commerce-tracking:doctor, then rerun provider_access_remediation_report.']
      }),
      `Provider access remediation report: ${verifiedLive.length} verified live, ${failClosed.length} fail-closed.`
    )
  }
)

server.registerTool(
  'provider_env_readiness',
  {
    title: 'Provider Environment Readiness',
    description: 'Report presence-only credential readiness for commerce, tracking, observability, and deployment providers. Secret values are never returned.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('provider_env_readiness', readinessDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const manifest = credentialManifest()
    const presence = envPresence()
    const providers = providerDefinitions.map(provider => {
      const env = provider.env.map(key => {
        const item = presence.env.get(key)
        return {
          key,
          present: item?.present ?? false,
          sources: item?.sources ?? []
        }
      })
      const credentialFiles = provider.credentialFiles.map(key => {
        const item = manifest.credentialFiles?.[key]
        const relativePath = item?.path ?? ''
        return {
          key,
          path: relativePath,
          exists: relativePath ? fileExists(relativePath) : false,
          required: Boolean(item?.required)
        }
      })
      const checks = [...env.map(item => item.present), ...credentialFiles.map(item => item.exists || !item.required)]
      const presentCount = checks.filter(Boolean).length
      const liveReadiness =
        presentCount === checks.length && checks.length > 0 ? 'ready'
        : presentCount > 0 ? 'partial'
        : 'missing_credentials'

      return {
        id: provider.id,
        label: provider.label,
        env,
        credential_files: credentialFiles,
        live_readiness: liveReadiness
      }
    })
    const data = {
      env_files: presence.maps.map(item => ({ path: item.file, exists: item.exists })),
      providers
    }

    return textResult(
      createEnvelope('provider_env_readiness', startedAt, data, {
        sources: [{ path: 'config/mcp/credentials.manifest.json', type: 'credential-manifest' }],
        next: ['Missing credentials mean the profile can still inspect local code, but must not claim live provider status.']
      }),
      `Checked presence-only readiness for ${providers.length} providers.`
    )
  }
)

function normalizeShopifyDomain(domain) {
  return domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

function mapShopifyProduct(product) {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    available_for_sale: Boolean(product.availableForSale),
    variants: (product.variants?.edges ?? []).map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      sku: edge.node.sku || null,
      available_for_sale: Boolean(edge.node.availableForSale),
      currently_not_in_stock: typeof edge.node.currentlyNotInStock === 'boolean' ? edge.node.currentlyNotInStock : null,
      quantity_available: typeof edge.node.quantityAvailable === 'number' ? edge.node.quantityAvailable : null,
      price_amount: edge.node.price?.amount ?? '',
      currency_code: edge.node.price?.currencyCode ?? '',
      selected_options: edge.node.selectedOptions ?? []
    }))
  }
}

function mapShopifyAdminProduct(product) {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    status: product.status,
    total_inventory: typeof product.totalInventory === 'number' ? product.totalInventory : null,
    variants: (product.variants?.nodes ?? []).map(variant => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku || null,
      inventory_quantity: typeof variant.inventoryQuantity === 'number' ? variant.inventoryQuantity : null,
      price: variant.price ?? null
    }))
  }
}

server.registerTool(
  'shopify_admin_catalog_probe',
  {
    title: 'Shopify Admin Catalog Probe',
    description: 'Run a bounded read-only Shopify Admin GraphQL probe for shop identity, product status, inventory totals, variants, and SKUs when Admin credentials/scopes permit.',
    inputSchema: z.object({
      products_first: z.number().int().min(1).max(10).optional(),
      variants_first: z.number().int().min(1).max(25).optional(),
      query: z.string().min(1).max(120).optional()
    }),
    outputSchema: envelopeSchema('shopify_admin_catalog_probe', shopifyAdminCatalogProbeDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ products_first: productsFirst, variants_first: variantsFirst, query }) => {
    const startedAt = nowIso()
    const rawDomain = secretEnvValue('SHOPIFY_STORE_DOMAIN')
    const token = secretEnvValue('SHOPIFY_ADMIN_API_TOKEN')
    const apiVersion = secretEnvValue('SHOPIFY_API_VERSION') || '2025-10'
    const baseData = {
      store_domain: rawDomain ? normalizeShopifyDomain(rawDomain) : null,
      api_version: apiVersion,
      shop: {
        name: null,
        myshopify_domain: null,
        primary_domain_url: null,
        plan_display_name: null
      },
      products: [],
      graphql_errors: [],
      http_status: null
    }

    if (!rawDomain || !token) {
      return textResult(
        createEnvelope('shopify_admin_catalog_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'SHOPIFY_ADMIN_CONFIG_MISSING',
              'SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_TOKEN is missing.',
              'Set Shopify Admin credentials with read scopes, then rerun this tool.',
              'shopify_admin'
            )
          ],
          sources: [
            { url: 'https://shopify.dev/docs/api/admin-graphql/latest', type: 'official-docs' },
            { path: 'src/lib/shopify/admin.ts', type: 'local-reference' }
          ],
          networkAccess: true,
          next: ['Call provider_env_readiness to inspect Shopify Admin credential presence.']
        }),
        'Shopify Admin credentials are missing.'
      )
    }

    const endpoint = `https://${normalizeShopifyDomain(rawDomain)}/admin/api/${apiVersion}/graphql.json`
    const gql = `query UtekosAdminCatalogProbe($productsFirst: Int!, $variantsFirst: Int!, $query: String) {
      shop {
        name
        myshopifyDomain
        primaryDomain {
          url
        }
        plan {
          displayName
        }
      }
      products(first: $productsFirst, query: $query) {
        nodes {
          id
          handle
          title
          status
          totalInventory
          variants(first: $variantsFirst) {
            nodes {
              id
              title
              sku
              inventoryQuantity
              price
            }
          }
        }
      }
    }`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        query: gql,
        variables: {
          productsFirst: productsFirst ?? 3,
          variantsFirst: variantsFirst ?? 10,
          query: query ?? 'status:active'
        }
      })
    })
    const body = await response.json()
    const graphqlErrors = (body.errors ?? []).map(error => error.message).filter(Boolean)
    const products = (body.data?.products?.nodes ?? []).map(mapShopifyAdminProduct)
    const shop = body.data?.shop
    const data = {
      ...baseData,
      shop: {
        name: shop?.name ?? null,
        myshopify_domain: shop?.myshopifyDomain ?? null,
        primary_domain_url: shop?.primaryDomain?.url ?? null,
        plan_display_name: shop?.plan?.displayName ?? null
      },
      products,
      graphql_errors: graphqlErrors,
      http_status: response.status
    }

    return textResult(
      createEnvelope('shopify_admin_catalog_probe', startedAt, data, {
        ok: response.ok && graphqlErrors.length === 0,
        errors:
          response.ok && graphqlErrors.length === 0 ?
            []
          : [
              makeError(
                'SHOPIFY_ADMIN_QUERY_FAILED',
                `Shopify Admin query failed with HTTP ${response.status} and ${graphqlErrors.length} GraphQL error(s).`,
                'Verify Admin API token scopes, API version, and query field availability.',
                'shopify_admin'
              )
            ],
        sources: [
          { url: 'https://shopify.dev/docs/api/admin-graphql/latest', type: 'official-docs' },
          { url: 'https://shopify.dev/docs/api/admin-graphql/latest/queries/products', type: 'official-docs' },
          { url: 'https://shopify.dev/docs/api/admin-graphql/latest/queries/productVariants', type: 'official-docs' },
          { path: 'src/lib/shopify/admin.ts', type: 'local-reference' }
        ],
        networkAccess: true,
        limits: { products_first: productsFirst ?? 3, variants_first: variantsFirst ?? 10 },
        next: ['Use Admin catalog data as sensitive internal commerce evidence only; do not expose customer/order data through this tool.']
      }),
      `Shopify Admin probe returned ${products.length} product(s).`
    )
  }
)

server.registerTool(
  'shopify_storefront_product_probe',
  {
    title: 'Shopify Storefront Product Probe',
    description: 'Run a read-only Shopify Storefront GraphQL probe for product handles, variants, SKUs, availability, price, and storefront inventory signals when credentials/scopes permit.',
    inputSchema: z.object({
      handle: z.string().min(1).max(160).regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/).optional(),
      products_first: z.number().int().min(1).max(10).optional(),
      variants_first: z.number().int().min(1).max(50).optional()
    }),
    outputSchema: envelopeSchema('shopify_storefront_product_probe', shopifyStorefrontProbeDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ handle, products_first: productsFirst, variants_first: variantsFirst }) => {
    const startedAt = nowIso()
    const rawDomain = secretEnvValue('SHOPIFY_STORE_DOMAIN')
    const token = secretEnvValue('SHOPIFY_STOREFRONT_ACCESS_TOKEN')
    const apiVersion = secretEnvValue('SHOPIFY_API_VERSION') || '2025-10'
    const baseData = {
      store_domain: rawDomain ? normalizeShopifyDomain(rawDomain) : null,
      api_version: apiVersion,
      query_mode: handle ? 'handle' : 'available_products',
      requested_handle: handle ?? null,
      products: [],
      graphql_errors: [],
      http_status: null
    }

    if (!rawDomain || !token) {
      return textResult(
        createEnvelope('shopify_storefront_product_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'SHOPIFY_STOREFRONT_CONFIG_MISSING',
              'SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing.',
              'Set the missing storefront env values, then rerun this tool.'
            )
          ],
          sources: [{ path: 'src/db/config/shopify.config.ts', type: 'shopify-config' }],
          next: ['Call provider_env_readiness to see which Shopify env values are present.']
        }),
        'Shopify Storefront credentials are missing.'
      )
    }

    const endpoint = `https://${normalizeShopifyDomain(rawDomain)}/api/${apiVersion}/graphql.json`
    const variantsLimit = variantsFirst ?? 20
    const query =
      handle ?
        `query UtekosProductByHandle($handle: String!, $variantsFirst: Int!) {
          product(handle: $handle) {
            id
            handle
            title
            availableForSale
            variants(first: $variantsFirst) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  currentlyNotInStock
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }`
      : `query UtekosAvailableProducts($productsFirst: Int!, $variantsFirst: Int!) {
          products(first: $productsFirst, query: "available_for_sale:true") {
            edges {
              node {
                id
                handle
                title
                availableForSale
                variants(first: $variantsFirst) {
                  edges {
                    node {
                      id
                      title
                      sku
                      availableForSale
                      currentlyNotInStock
                      quantityAvailable
                      price {
                        amount
                        currencyCode
                      }
                      selectedOptions {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }`
    const variables =
      handle ?
        { handle, variantsFirst: variantsLimit }
      : { productsFirst: productsFirst ?? 3, variantsFirst: variantsLimit }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token
      },
      body: JSON.stringify({ query, variables })
    })
    const body = await response.json()
    const graphqlErrors = (body.errors ?? []).map(error => error.message).filter(Boolean)
    const products =
      handle ?
        body.data?.product ? [mapShopifyProduct(body.data.product)] : []
      : (body.data?.products?.edges ?? []).map(edge => mapShopifyProduct(edge.node))
    const data = {
      ...baseData,
      products,
      graphql_errors: graphqlErrors,
      http_status: response.status
    }

    return textResult(
      createEnvelope('shopify_storefront_product_probe', startedAt, data, {
        ok: response.ok && graphqlErrors.length === 0,
        errors:
          response.ok && graphqlErrors.length === 0 ?
            []
          : [
              makeError(
                'SHOPIFY_STOREFRONT_QUERY_FAILED',
                `Shopify Storefront query failed with HTTP ${response.status} and ${graphqlErrors.length} GraphQL error(s).`,
                'Verify token scopes and Storefront API version. quantityAvailable requires storefront inventory access in some shop configurations.'
              )
            ],
        sources: [
          { url: 'https://shopify.dev/docs/api/storefront/latest', type: 'official-docs' },
          { path: 'src/db/config/shopify.config.ts', type: 'shopify-config' }
        ],
        networkAccess: true,
        limits: { products_first: productsFirst ?? 3, variants_first: variantsLimit },
        next: ['Use returned variant SKU and availability data as evidence only if ok is true.']
      }),
      `Shopify Storefront probe returned ${products.length} product(s).`
    )
  }
)

server.registerTool(
  'ga4_event_status_probe',
  {
    title: 'GA4 Event Status Probe',
    description: 'Read GA4 realtime and recent event counts for canonical Utekos commerce events using Google Analytics Data API runRealtimeReport and runReport.',
    inputSchema: z.object({
      days_back: z.number().int().min(1).max(30).optional()
    }),
    outputSchema: envelopeSchema('ga4_event_status_probe', ga4EventStatusDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ days_back: daysBack }) => {
    const startedAt = nowIso()
    const propertyId = secretEnvValue('GOOGLE_ANALYTICS_PROPERTY_ID') || secretEnvValue('GA_PROPERTY_ID') || '489598217'
    const baseData = {
      property_id: propertyId,
      realtime: {
        counts: {},
        expected_events: mapExpectedEventCoverage({})
      },
      report: {
        date_range: {
          start_date: `${daysBack ?? 1}daysAgo`,
          end_date: 'today'
        },
        counts: {},
        expected_events: mapExpectedEventCoverage({})
      }
    }

    try {
      const serviceAccount = credentialJsonFor(
        [
          'GOOGLE_ANALYTICS_DATA_API_SERVICE_ACCOUNT_JSON',
          'GOOGLE_ANALYTICS_CREDENTIALS_PATH',
          'GOOGLE_APPLICATION_CREDENTIALS',
          'GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON',
          'GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON',
          'GA_SERVICE_ACCOUNT_JSON',
          'MERCHANT_CENTER_CREDENTIALS_PATH'
        ],
        [
          'src/api/lib/cloud-credentials/google-analytics-data-api-service-account.json',
          'src/api/lib/cloud-credentials/tag-manager-credentials.json',
          'src/api/lib/cloud-credentials/merchant-center-credentials.json'
        ]
      )
      const client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: serviceAccount.clientEmail,
          private_key: serviceAccount.privateKey
        },
        ...(serviceAccount.projectId ? { projectId: serviceAccount.projectId } : {})
      })
      const property = `properties/${propertyId}`
      const [realtimeReport] = await client.runRealtimeReport({
        property,
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }]
      })
      const [report] = await client.runReport({
        property,
        dateRanges: [{ startDate: `${daysBack ?? 1}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }]
      })
      const realtimeCounts = mapEventCounts(realtimeReport.rows)
      const reportCounts = mapEventCounts(report.rows)
      const data = {
        property_id: propertyId,
        realtime: {
          counts: realtimeCounts,
          expected_events: mapExpectedEventCoverage(realtimeCounts)
        },
        report: {
          date_range: {
            start_date: `${daysBack ?? 1}daysAgo`,
            end_date: 'today'
          },
          counts: reportCounts,
          expected_events: mapExpectedEventCoverage(reportCounts)
        }
      }

      return textResult(
        createEnvelope('ga4_event_status_probe', startedAt, data, {
          sources: [
            { url: 'https://developers.google.com/analytics/devguides/reporting/data/v1/rest', type: 'official-docs' },
            { path: 'src/lib/google/analytics-data/getGoogleAnalyticsEventStatus.ts', type: 'local-reference' }
          ],
          networkAccess: true,
          limits: { days_back: daysBack ?? 1 },
          next: ['Treat missing expected events as a provider-observed signal to investigate consent/browser/server dispatch.']
        }),
        `GA4 event status returned ${Object.keys(reportCounts).length} recent event names.`
      )
    } catch (error) {
      return textResult(
        createEnvelope('ga4_event_status_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'GA4_EVENT_STATUS_FAILED',
              error instanceof Error ? error.message : 'Google Analytics Data API status failed.',
              'Verify GA4 property id and service account access, then rerun this tool.',
              'google_analytics'
            )
          ],
          sources: [{ url: 'https://developers.google.com/analytics/devguides/reporting/data/v1/rest', type: 'official-docs' }],
          networkAccess: true,
          next: ['Call provider_env_readiness to confirm GA4 credential presence.']
        }),
        'GA4 event status probe failed with structured error.'
      )
    }
  }
)

function normalizeMerchantDataSource(dataSource) {
  return {
    name: dataSource.name,
    display_name: dataSource.displayName,
    input: dataSource.input,
    primary_product_data_source: Boolean(dataSource.primaryProductDataSource)
  }
}

function normalizeMerchantAccountIssue(issue) {
  return {
    name: issue.name,
    title: issue.title,
    severity: issue.severity
  }
}

function normalizeMerchantAggregateStatus(status) {
  return {
    name: status.name,
    reporting_context: status.reportingContext,
    status: status.status,
    issues_count: Array.isArray(status.itemLevelIssues) ? status.itemLevelIssues.length : 0
  }
}

function normalizeMerchantProduct(product) {
  return {
    name: product.name,
    offer_id: product.offerId,
    content_language: product.contentLanguage,
    feed_label: product.feedLabel,
    issues_count: Array.isArray(product.issues) ? product.issues.length : 0
  }
}

async function safeMerchantRequest(request) {
  try {
    const result = await googleMerchantRequest(request)
    return result
  } catch (error) {
    return {
      ok: false,
      status: null,
      body: {
        error: {
          message: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, '')
}

async function readJsonEndpoint(url, options) {
  const response = await fetch(url, {
    ...options,
    cache: 'no-store'
  })
  const responseText = await response.text()
  let body = null

  if (responseText) {
    try {
      body = JSON.parse(responseText)
    } catch {
      body = {
        error: {
          message: responseText.slice(0, 400)
        }
      }
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    body
  }
}

function normalizePostHogEvents(body) {
  return (body?.results ?? [])
    .map(row => {
      if (Array.isArray(row)) {
        return {
          event_name: String(row[0] ?? ''),
          event_count: Number(row[1] ?? 0)
        }
      }

      return {
        event_name: String(row?.event_name ?? row?.event ?? ''),
        event_count: Number(row?.event_count ?? row?.count ?? 0)
      }
    })
    .filter(row => row.event_name && Number.isFinite(row.event_count))
}

function normalizePostHogProject(project) {
  return {
    id: typeof project.id === 'number' ? project.id : null,
    project_id: typeof project.project_id === 'number' ? project.project_id : null,
    uuid: typeof project.uuid === 'string' ? project.uuid : null,
    name: typeof project.name === 'string' ? project.name : null,
    timezone: typeof project.timezone === 'string' ? project.timezone : null,
    ingested_event: typeof project.ingested_event === 'boolean' ? project.ingested_event : null,
    access_control: typeof project.access_control === 'boolean' ? project.access_control : null,
    app_urls: Array.isArray(project.app_urls) ? project.app_urls.filter(value => typeof value === 'string') : []
  }
}

function eventCoverageFromRows(rows) {
  const counts = Object.fromEntries(rows.map(row => [row.event_name, row.event_count]))
  return mapExpectedEventCoverage(counts)
}

function normalizeSentryIssue(issue) {
  return {
    id: issue.id,
    short_id: issue.shortId,
    title: issue.title,
    culprit: issue.culprit,
    level: issue.level,
    status: issue.status,
    count: issue.count,
    user_count: typeof issue.userCount === 'number' ? issue.userCount : undefined,
    first_seen: issue.firstSeen,
    last_seen: issue.lastSeen,
    permalink: issue.permalink
  }
}

function normalizeVercelDeployment(deployment) {
  return {
    uid: deployment.uid,
    name: deployment.name,
    url: deployment.url ?? null,
    state: deployment.state,
    target: deployment.target ?? null,
    created_at: deployment.createdAt,
    ready_at: deployment.ready ?? deployment.readyAt ?? null,
    creator: deployment.creator?.username ?? deployment.creator?.uid ?? null,
    git_branch: deployment.meta?.githubCommitRef ?? deployment.meta?.gitlabCommitRef ?? deployment.meta?.bitbucketCommitRef ?? null,
    git_commit_sha: deployment.meta?.githubCommitSha ?? deployment.meta?.gitlabCommitSha ?? deployment.meta?.bitbucketCommitSha ?? null,
    git_commit_message:
      typeof deployment.meta?.githubCommitMessage === 'string' ?
        deployment.meta.githubCommitMessage.slice(0, 240)
      : null
  }
}

async function probeHttpEndpoint(label, url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    })
    await response.arrayBuffer()

    return {
      label,
      url,
      ok: response.ok,
      status: response.status,
      content_type: response.headers.get('content-type')
    }
  } catch {
    return {
      label,
      url,
      ok: false,
      status: null,
      content_type: null
    }
  }
}

function normalizeMetaDatasetQualityEvent(event) {
  const diagnostics = event.event_match_quality?.diagnostics

  return {
    event_name: event.event_name,
    event_match_quality_score:
      typeof event.event_match_quality?.composite_score === 'number' ? event.event_match_quality.composite_score : null,
    event_coverage_percentage:
      typeof event.event_coverage?.percentage === 'number' ? event.event_coverage.percentage : null,
    dedupe_feedback_present: Boolean(event.dedupe_key_feedback),
    data_freshness_present: Boolean(event.data_freshness),
    diagnostics_count: Array.isArray(diagnostics) ? diagnostics.length : 0
  }
}

function normalizeGtmWorkspace(workspace) {
  return {
    path: workspace.path,
    account_id: workspace.accountId,
    container_id: workspace.containerId,
    workspace_id: workspace.workspaceId,
    name: workspace.name,
    description: workspace.description,
    fingerprint: workspace.fingerprint
  }
}

function nullableString(value) {
  if (value === undefined || value === null || value === '') return null
  return String(value)
}

function numericValue(value) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function nullableNumericValue(value) {
  if (value === undefined || value === null || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function isoDateDaysAgo(daysBack) {
  const date = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function googleAdsSources() {
  return [
    { url: 'https://developers.google.com/google-ads/api/rest/auth', type: 'official-docs' },
    { url: 'https://developers.google.com/google-ads/api/rest/examples', type: 'official-docs' },
    { url: 'https://developers.google.com/google-ads/api/docs/get-started/make-first-call', type: 'official-docs' },
    { path: 'src/lib/google/data-manager/dataManagerConfig.ts', type: 'local-reference' }
  ]
}

function microsoftAdsSources() {
  return [
    { url: 'https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-mfa?view=bingads-13', type: 'official-docs' },
    { url: 'https://learn.microsoft.com/en-us/advertising/guides/sdk-authentication?view=bingads-13', type: 'official-docs' },
    { url: 'https://learn.microsoft.com/en-us/advertising/guides/get-started?view=bingads-13', type: 'official-docs' },
    { url: 'https://learn.microsoft.com/en-us/advertising/guides/ad-insight-guides?view=bingads-13', type: 'official-docs' },
    { path: 'docs/microsoft/advertising-api.md', type: 'local-docs' }
  ]
}

function microsoftShoppingSources() {
  return [
    { url: 'https://learn.microsoft.com/en-us/advertising/shopping-content/get-started', type: 'official-docs' },
    { path: 'docs/microsoft/advertising-api.md', type: 'local-docs' }
  ]
}

function microsoftClaritySources() {
  return [
    { url: 'https://learn.microsoft.com/en-us/clarity/advertising/advertising-dashboard', type: 'official-docs' },
    { url: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2', type: 'official-docs' },
    { path: 'docs/microsoft/advertising-api.md', type: 'local-docs' }
  ]
}

function normalizeMicrosoftAdsId(value) {
  return value.trim().replaceAll('-', '')
}

function microsoftAdsEnvironment() {
  const value = (secretEnvValue('MICROSOFT_ADS_ENVIRONMENT') || 'production').trim().toLowerCase()
  return value === 'sandbox' ? 'sandbox' : 'production'
}

function microsoftAdsConfig() {
  const accessToken = secretEnvValue('MICROSOFT_ADS_ACCESS_TOKEN')
  const refreshToken = rotatedMicrosoftAdsRefreshToken || secretEnvValue('MICROSOFT_ADS_REFRESH_TOKEN')
  const rawCustomerId = secretEnvValue('MICROSOFT_ADS_CUSTOMER_ID')
  const rawAccountId = secretEnvValue('MICROSOFT_ADS_ACCOUNT_ID')
  const rawStoreId = secretEnvValue('MICROSOFT_MERCHANT_CENTER_STORE_ID')
  const tokenClaims = decodeJwtPayload(accessToken)
  const scope = typeof tokenClaims?.scp === 'string' ? tokenClaims.scp : typeof tokenClaims?.scope === 'string' ? tokenClaims.scope : ''
  const scopePresent = tokenClaims ? scope.split(/\s+/).includes('msads.manage') : null
  const expiresAt =
    typeof tokenClaims?.exp === 'number' ?
      new Date(tokenClaims.exp * 1000).toISOString()
    : null

  return {
    environment: microsoftAdsEnvironment(),
    developerToken: secretEnvValue('MICROSOFT_ADS_DEVELOPER_TOKEN'),
    clientId: secretEnvValue('MICROSOFT_ADS_CLIENT_ID'),
    clientSecret: secretEnvValue('MICROSOFT_ADS_CLIENT_SECRET'),
    accessToken,
    refreshToken,
    customerId: rawCustomerId ? normalizeMicrosoftAdsId(rawCustomerId) : '',
    accountId: rawAccountId ? normalizeMicrosoftAdsId(rawAccountId) : '',
    merchantCenterStoreId: rawStoreId ? normalizeMicrosoftAdsId(rawStoreId) : '',
    parsedAccessToken: {
      inspectable: Boolean(tokenClaims),
      scope_present: scopePresent,
      expires_at: expiresAt,
      tenant: typeof tokenClaims?.tid === 'string' ? tokenClaims.tid : null
    }
  }
}

function decodeJwtPayload(token) {
  if (!token || !token.includes('.')) return null
  const [, payload] = token.split('.')
  if (!payload) return null

  try {
    const normalized = payload.replaceAll('-', '+').replaceAll('_', '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

function microsoftAdsBaseFields(surface) {
  const config = microsoftAdsConfig()
  return {
    environment: config.environment,
    customer_id: config.customerId || null,
    account_id: config.accountId || null,
    ...(surface ? { surface } : {})
  }
}

function microsoftAdsMissingRequirements(options = {}) {
  const config = microsoftAdsConfig()
  const missing = []
  if (!config.developerToken) missing.push('MICROSOFT_ADS_DEVELOPER_TOKEN')
  if (!config.clientId) missing.push('MICROSOFT_ADS_CLIENT_ID')
  if (!config.accessToken && !config.refreshToken) missing.push('MICROSOFT_ADS_ACCESS_TOKEN|MICROSOFT_ADS_REFRESH_TOKEN')
  else if (!config.refreshToken) missing.push('MICROSOFT_ADS_REFRESH_TOKEN')
  if (options.requireCustomerId && !config.customerId) missing.push('MICROSOFT_ADS_CUSTOMER_ID')
  if (options.requireAccountId && !config.accountId) missing.push('MICROSOFT_ADS_ACCOUNT_ID')
  if (options.requireMerchantStoreId && !config.merchantCenterStoreId) missing.push('MICROSOFT_MERCHANT_CENTER_STORE_ID')
  if (config.parsedAccessToken.inspectable && config.parsedAccessToken.scope_present === false) missing.push('MICROSOFT_ADS_ACCESS_TOKEN scope msads.manage')
  return missing
}

function microsoftAdsAuthReady(options = {}) {
  return microsoftAdsMissingRequirements(options).length === 0
}

function microsoftAdsEndpoint(service) {
  const environment = microsoftAdsEnvironment()
  const sandboxPrefix = environment === 'sandbox' ? '.sandbox' : ''
  if (service === 'customer') return `https://clientcenter.api${sandboxPrefix}.bingads.microsoft.com/Api/CustomerManagement/v13/CustomerManagementService.svc`
  if (service === 'campaign') return `https://campaign.api${sandboxPrefix}.bingads.microsoft.com/Api/Advertiser/CampaignManagement/v13/CampaignManagementService.svc`
  if (service === 'adInsight') return `https://adinsight.api${sandboxPrefix}.bingads.microsoft.com/Api/Advertiser/AdInsight/v13/AdInsightService.svc`
  return `https://content.api${sandboxPrefix}.bingads.microsoft.com/shopping/v9.1/bmc`
}

function microsoftAdsNamespace(service) {
  if (service === 'customer') return 'https://bingads.microsoft.com/Customer/v13'
  if (service === 'adInsight') return 'https://bingads.microsoft.com/AdInsight/v13'
  return 'https://bingads.microsoft.com/CampaignManagement/v13'
}

async function googleTagManagerAccessToken() {
  const explicitToken = secretEnvValue('GTM_ACCESS_TOKEN') || secretEnvValue('GOOGLE_TAG_MANAGER_ACCESS_TOKEN')
  if (explicitToken) return explicitToken

  const serviceAccount = credentialJsonFor(
    [
      'GTM_SERVICE_ACCOUT',
      'GTM_SERVICE_ACCOUNT',
      'GTM_SERVICE_ACCOUNT_JSON_PATH',
      'GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON',
      'GOOGLE_APPLICATION_CREDENTIALS'
    ],
    [
      'src/api/lib/cloud-credentials/tag-manager-credentials.json',
      'src/api/lib/cloud-credentials/google-tag-manager-credentials.json'
    ]
  )
  const auth = new GoogleAuth({
    credentials: {
      client_email: serviceAccount.clientEmail,
      private_key: serviceAccount.privateKey
    },
    scopes: [googleTagManagerReadonlyScope],
    ...(serviceAccount.projectId ? { projectId: serviceAccount.projectId } : {})
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return typeof token === 'string' ? token : token?.token ?? ''
}

async function resolveGtmContainerId({ token, accountId, configuredContainerId, publicContainerId }) {
  if (configuredContainerId) return configuredContainerId
  if (!publicContainerId) return ''

  const response = await readJsonEndpoint(`https://www.googleapis.com/tagmanager/v2/accounts/${encodeURIComponent(accountId)}/containers`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(response.body?.error?.message || `GTM container lookup failed with HTTP ${response.status}.`)
  }

  const containers = Array.isArray(response.body?.container) ? response.body.container : []
  const match = containers.find(container =>
    container?.publicId === publicContainerId
    || container?.containerId === publicContainerId
  )

  return typeof match?.containerId === 'string' ? match.containerId : ''
}

async function microsoftAdsAccessToken() {
  const config = microsoftAdsConfig()
  const cachedTokenClaims = decodeJwtPayload(cachedMicrosoftAdsAccessToken ?? '')
  const cachedExpiresAt =
    typeof cachedTokenClaims?.exp === 'number' ?
      cachedTokenClaims.exp * 1000
    : cachedMicrosoftAdsAccessTokenExpiresAt

  if (
    cachedMicrosoftAdsAccessToken
    && cachedExpiresAt > Date.now() + 60_000
  ) {
    return cachedMicrosoftAdsAccessToken
  }

  if (!config.refreshToken || !config.clientId) {
    return config.accessToken
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    grant_type: 'refresh_token',
    refresh_token: config.refreshToken,
    scope: microsoftOAuthScope
  })
  if (config.clientSecret) body.set('client_secret', config.clientSecret)

  const response = await readJsonEndpoint(microsoftOAuthTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok || typeof response.body?.access_token !== 'string') {
    throw new Error(response.body?.error_description || response.body?.error || 'Microsoft OAuth refresh-token exchange failed.')
  }

  cachedMicrosoftAdsAccessToken = response.body.access_token
  cachedMicrosoftAdsAccessTokenExpiresAt =
    Date.now() + Math.max(0, Number(response.body?.expires_in ?? 3600) - 60) * 1000

  if (typeof response.body?.refresh_token === 'string' && response.body.refresh_token.trim()) {
    rotatedMicrosoftAdsRefreshToken = response.body.refresh_token
  }

  return response.body.access_token
}

function microsoftAdsSoapEnvelope({ service, action, body, accessToken }) {
  const config = microsoftAdsConfig()
  const namespace = microsoftAdsNamespace(service)
  const customerHeader = config.customerId ? `<CustomerId>${config.customerId}</CustomerId>` : ''
  const accountHeader = config.accountId ? `<CustomerAccountId>${config.accountId}</CustomerAccountId>` : ''

  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Header xmlns="${namespace}">
    <Action mustUnderstand="1">${action}</Action>
    <AuthenticationToken>${escapeXml(accessToken)}</AuthenticationToken>
    <DeveloperToken>${escapeXml(config.developerToken)}</DeveloperToken>
    ${customerHeader}
    ${accountHeader}
  </s:Header>
  <s:Body>
    ${body}
  </s:Body>
</s:Envelope>`
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

async function readTextEndpoint(url, options) {
  const response = await fetch(url, {
    ...options,
    cache: 'no-store'
  })
  const body = await response.text()
  return {
    ok: response.ok,
    status: response.status,
    body
  }
}

async function microsoftAdsSoapRequest({ service, action, body }) {
  const endpoint = microsoftAdsEndpoint(service)
  const accessToken = await microsoftAdsAccessToken()
  if (!accessToken) throw new Error('Missing Microsoft Advertising access token or refresh-token configuration.')
  const response = await readTextEndpoint(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: action
    },
    body: microsoftAdsSoapEnvelope({ service, action, body, accessToken })
  })
  return {
    ...response,
    endpoint
  }
}

async function safeMicrosoftAdsSoapRequest(request) {
  try {
    return await microsoftAdsSoapRequest(request)
  } catch (error) {
    return {
      ok: false,
      status: null,
      endpoint: microsoftAdsEndpoint(request.service),
      body: error instanceof Error ? error.message : String(error)
    }
  }
}

function summarizeMicrosoftXml(body, itemPatterns = []) {
  const text = typeof body === 'string' ? body : ''
  const faultCode = text.match(/<[^>]*FaultCode[^>]*>([^<]+)<\/[^>]*FaultCode>/i)?.[1]
    || text.match(/<faultcode[^>]*>([^<]+)<\/faultcode>/i)?.[1]
    || null
  const faultMessage = text.match(/<[^>]*Message[^>]*>([^<]+)<\/[^>]*Message>/i)?.[1]
    || text.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/i)?.[1]
    || null
  const itemCount =
    itemPatterns.length > 0 ?
      itemPatterns.reduce((count, pattern) => count + (text.match(pattern) ?? []).length, 0)
    : null

  return {
    body_present: text.length > 0,
    fault_code: faultCode,
    fault_message: faultMessage,
    item_count: itemCount
  }
}

function microsoftAdsConfigMissingResult(toolName, startedAt, data, missing, sources, next = []) {
  return textResult(
    createEnvelope(toolName, startedAt, data, {
      ok: false,
      errors: [
        makeError(
          'MICROSOFT_ADS_CONFIG_MISSING',
          `Missing Microsoft Advertising configuration: ${missing.join(', ')}.`,
          'Complete MFA-compliant OAuth for msads.manage, set developer token plus CustomerId/AccountId where required, then rerun this tool.',
          'microsoft_ads'
        )
      ],
      sources,
      networkAccess: true,
      next: ['Call provider_env_readiness to inspect Microsoft Ads credential presence.', ...next]
    }),
    'Microsoft Advertising config is missing.'
  )
}

function googleAdsBaseFields() {
  const config = googleAdsConfig()
  return {
    api_version: config.apiVersion,
    customer_id: config.customerId || null,
    login_customer_id: config.loginCustomerId || null
  }
}

function googleAdsMissingRequirements(requireCustomerId) {
  const config = googleAdsConfig()
  const missing = []
  if (requireCustomerId && !config.customerId) missing.push('GOOGLE_ADS_CUSTOMER_ID')
  if (!config.developerToken) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN')
  if (config.credentialMode === 'missing') {
    missing.push('GOOGLE_ADS_ACCESS_TOKEN|GOOGLE_ADS_OAUTH_ACCESS_TOKEN|GOOGLE_ADS_CLIENT_ID+GOOGLE_ADS_CLIENT_SECRET+GOOGLE_ADS_REFRESH_TOKEN|GOOGLE_ADS_SERVICE_ACCOUNT_JSON')
  }
  return missing
}

function googleAdsConfigMissingResult(toolName, startedAt, data, missing, next = []) {
  return textResult(
    createEnvelope(toolName, startedAt, data, {
      ok: false,
      errors: [
        makeError(
          'GOOGLE_ADS_CONFIG_MISSING',
          `Missing Google Ads configuration: ${missing.join(', ')}.`,
          'Set Google Ads developer token, read-capable OAuth/service-account credentials, and customer id where required, then rerun this tool.',
          'google_ads'
        )
      ],
      sources: googleAdsSources(),
      networkAccess: true,
      next: ['Call provider_env_readiness to inspect Google Ads credential presence.', ...next]
    }),
    'Google Ads config is missing.'
  )
}

function googleAdsMetrics(metrics = {}) {
  return {
    clicks: numericValue(metrics.clicks),
    impressions: numericValue(metrics.impressions),
    ctr: numericValue(metrics.ctr),
    average_cpc_micros: numericValue(metrics.averageCpc),
    cost_micros: numericValue(metrics.costMicros),
    conversions: numericValue(metrics.conversions),
    conversions_value: numericValue(metrics.conversionsValue),
    all_conversions: numericValue(metrics.allConversions),
    all_conversions_value: numericValue(metrics.allConversionsValue)
  }
}

function normalizeGoogleAdsCampaign(row) {
  return {
    campaign_id: nullableString(row.campaign?.id),
    name: nullableString(row.campaign?.name),
    status: nullableString(row.campaign?.status),
    advertising_channel_type: nullableString(row.campaign?.advertisingChannelType),
    bidding_strategy_type: nullableString(row.campaign?.biddingStrategyType),
    optimization_score: nullableNumericValue(row.campaign?.optimizationScore),
    budget_amount_micros: nullableNumericValue(row.campaignBudget?.amountMicros),
    date: nullableString(row.segments?.date),
    metrics: googleAdsMetrics(row.metrics)
  }
}

function normalizeGoogleAdsConversionAction(row) {
  return {
    id: nullableString(row.conversionAction?.id),
    name: nullableString(row.conversionAction?.name),
    status: nullableString(row.conversionAction?.status),
    type: nullableString(row.conversionAction?.type),
    category: nullableString(row.conversionAction?.category),
    origin: nullableString(row.conversionAction?.origin),
    primary_for_goal:
      typeof row.conversionAction?.primaryForGoal === 'boolean' ?
        row.conversionAction.primaryForGoal
      : null,
    include_in_conversions_metric:
      typeof row.conversionAction?.includeInConversionsMetric === 'boolean' ?
        row.conversionAction.includeInConversionsMetric
      : null,
    owner_customer: nullableString(row.conversionAction?.ownerCustomer),
    last_conversion_date: nullableString(row.metrics?.conversionLastConversionDate),
    last_received_request_date_time: nullableString(row.metrics?.conversionLastReceivedRequestDateTime)
  }
}

function normalizeGoogleAdsSearchTerm(row) {
  return {
    search_term: nullableString(row.searchTermView?.searchTerm),
    status: nullableString(row.searchTermView?.status),
    campaign_id: nullableString(row.campaign?.id),
    campaign_name: nullableString(row.campaign?.name),
    ad_group_id: nullableString(row.adGroup?.id),
    ad_group_name: nullableString(row.adGroup?.name),
    date: nullableString(row.segments?.date),
    metrics: googleAdsMetrics(row.metrics)
  }
}

server.registerTool(
  'google_ads_account_access_probe',
  {
    title: 'Google Ads Account Access Probe',
    description: 'Read Google Ads accessible customer resources and compare them with the configured customer id. Does not mutate accounts, campaigns, assets, audiences, or conversions.',
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional()
    }),
    outputSchema: envelopeSchema('google_ads_account_access_probe', googleAdsAccountAccessDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ limit }) => {
    const startedAt = nowIso()
    const config = googleAdsConfig()
    const accountLimit = limit ?? 50
    const baseData = {
      ...googleAdsBaseFields(),
      credential_mode: config.credentialMode,
      http_status: null,
      accessible_customer_count: 0,
      accessible_customers: [],
      configured_customer_accessible: null
    }
    const missing = googleAdsMissingRequirements(false)
    if (missing.length > 0) {
      return googleAdsConfigMissingResult('google_ads_account_access_probe', startedAt, baseData, missing, [
        'Set GOOGLE_ADS_CUSTOMER_ID after confirming which customer resource is accessible.'
      ])
    }

    const response = await safeGoogleAdsRequest({
      path: '/customers:listAccessibleCustomers',
      method: 'GET'
    })
    const accessibleCustomers = (response.body?.resourceNames ?? [])
      .filter(value => typeof value === 'string')
      .slice(0, accountLimit)
    const configuredCustomerResource = config.customerId ? `customers/${config.customerId}` : null
    const data = {
      ...baseData,
      http_status: response.status,
      accessible_customer_count: accessibleCustomers.length,
      accessible_customers: accessibleCustomers,
      configured_customer_accessible:
        configuredCustomerResource ? accessibleCustomers.includes(configuredCustomerResource) : null
    }

    return textResult(
      createEnvelope('google_ads_account_access_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'GOOGLE_ADS_ACCOUNT_ACCESS_FAILED',
                response.body?.error?.message || `Google Ads accessible customers query failed with HTTP ${response.status}.`,
                'Verify developer token approval, OAuth/service-account access, API enablement, and manager login-customer-id.',
                'google_ads'
              )
            ],
        sources: googleAdsSources(),
        networkAccess: true,
        limits: { limit: accountLimit },
        next: ['Use configured_customer_accessible before running account-scoped Google Ads reporting probes.']
      }),
      `Google Ads account access probe returned ${accessibleCustomers.length} accessible customer resource(s).`
    )
  }
)

server.registerTool(
  'google_ads_campaign_performance_probe',
  {
    title: 'Google Ads Campaign Performance Probe',
    description: 'Read bounded recent Google Ads campaign performance through GoogleAdsService.Search and GAQL. Does not mutate campaign state or budgets.',
    inputSchema: z.object({
      days_back: z.number().int().min(1).max(30).optional(),
      limit: z.number().int().min(1).max(100).optional()
    }),
    outputSchema: envelopeSchema('google_ads_campaign_performance_probe', googleAdsCampaignPerformanceDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ days_back: daysBack, limit }) => {
    const startedAt = nowIso()
    const windowDays = daysBack ?? 7
    const rowLimit = limit ?? 25
    const dateRange = {
      start_date: isoDateDaysAgo(windowDays),
      end_date: todayIsoDate()
    }
    const baseData = {
      ...googleAdsBaseFields(),
      date_range: dateRange,
      http_status: null,
      campaign_count: 0,
      campaigns: []
    }
    const missing = googleAdsMissingRequirements(true)
    if (missing.length > 0) {
      return googleAdsConfigMissingResult('google_ads_campaign_performance_probe', startedAt, baseData, missing)
    }

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.optimization_score,
        campaign_budget.amount_micros,
        segments.date,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.all_conversions,
        metrics.all_conversions_value
      FROM campaign
      WHERE segments.date >= '${dateRange.start_date}'
        AND segments.date <= '${dateRange.end_date}'
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
      LIMIT ${rowLimit}
    `
    const response = await googleAdsSearch(query)
    const campaigns = (response.body?.results ?? []).map(normalizeGoogleAdsCampaign)
    const data = {
      ...baseData,
      http_status: response.status,
      campaign_count: campaigns.length,
      campaigns
    }

    return textResult(
      createEnvelope('google_ads_campaign_performance_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'GOOGLE_ADS_CAMPAIGN_PERFORMANCE_FAILED',
                response.body?.error?.message || `Google Ads campaign GAQL query failed with HTTP ${response.status}.`,
                'Verify Google Ads customer id, login customer id, developer token status, OAuth scopes, and GAQL field availability for the API version.',
                'google_ads'
              )
            ],
        sources: [
          ...googleAdsSources(),
          { url: 'https://developers.google.com/google-ads/api/docs/api-policy/rmf', type: 'official-docs' }
        ],
        networkAccess: true,
        limits: { days_back: windowDays, limit: rowLimit },
        next: ['Use campaign cost/conversion rows as ad-platform evidence only if ok is true.']
      }),
      `Google Ads campaign performance probe returned ${campaigns.length} row(s).`
    )
  }
)

server.registerTool(
  'google_ads_conversion_action_probe',
  {
    title: 'Google Ads Conversion Action Probe',
    description: 'Read Google Ads conversion actions and recency metrics through GoogleAdsService.Search and GAQL. Does not upload conversions or mutate conversion settings.',
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional()
    }),
    outputSchema: envelopeSchema('google_ads_conversion_action_probe', googleAdsConversionActionDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ limit }) => {
    const startedAt = nowIso()
    const rowLimit = limit ?? 50
    const baseData = {
      ...googleAdsBaseFields(),
      http_status: null,
      conversion_action_count: 0,
      conversion_actions: []
    }
    const missing = googleAdsMissingRequirements(true)
    if (missing.length > 0) {
      return googleAdsConfigMissingResult('google_ads_conversion_action_probe', startedAt, baseData, missing)
    }

    const query = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.status,
        conversion_action.type,
        conversion_action.category,
        conversion_action.origin,
        conversion_action.primary_for_goal,
        conversion_action.include_in_conversions_metric,
        conversion_action.owner_customer,
        metrics.conversion_last_conversion_date,
        metrics.conversion_last_received_request_date_time
      FROM conversion_action
      ORDER BY conversion_action.name
      LIMIT ${rowLimit}
    `
    const response = await googleAdsSearch(query)
    const conversionActions = (response.body?.results ?? []).map(normalizeGoogleAdsConversionAction)
    const data = {
      ...baseData,
      http_status: response.status,
      conversion_action_count: conversionActions.length,
      conversion_actions: conversionActions
    }

    return textResult(
      createEnvelope('google_ads_conversion_action_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'GOOGLE_ADS_CONVERSION_ACTION_FAILED',
                response.body?.error?.message || `Google Ads conversion action GAQL query failed with HTTP ${response.status}.`,
                'Verify Google Ads customer access and conversion_action field support for the configured API version.',
                'google_ads'
              )
            ],
        sources: [
          ...googleAdsSources(),
          { url: 'https://developers.google.com/google-ads/api/fields/v24/metrics', type: 'official-docs' }
        ],
        networkAccess: true,
        limits: { limit: rowLimit },
        next: ['Use last_conversion_date and last_received_request_date_time to verify whether Google Ads is receiving/importing conversion evidence.']
      }),
      `Google Ads conversion action probe returned ${conversionActions.length} conversion action row(s).`
    )
  }
)

server.registerTool(
  'google_ads_search_terms_probe',
  {
    title: 'Google Ads Search Terms Probe',
    description: 'Read bounded Google Ads search-term performance through search_term_view and GAQL. Does not create negatives, keywords, assets, or campaign changes.',
    inputSchema: z.object({
      days_back: z.number().int().min(1).max(30).optional(),
      limit: z.number().int().min(1).max(100).optional()
    }),
    outputSchema: envelopeSchema('google_ads_search_terms_probe', googleAdsSearchTermsDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ days_back: daysBack, limit }) => {
    const startedAt = nowIso()
    const windowDays = daysBack ?? 7
    const rowLimit = limit ?? 25
    const dateRange = {
      start_date: isoDateDaysAgo(windowDays),
      end_date: todayIsoDate()
    }
    const baseData = {
      ...googleAdsBaseFields(),
      date_range: dateRange,
      http_status: null,
      search_term_count: 0,
      search_terms: []
    }
    const missing = googleAdsMissingRequirements(true)
    if (missing.length > 0) {
      return googleAdsConfigMissingResult('google_ads_search_terms_probe', startedAt, baseData, missing)
    }

    const query = `
      SELECT
        search_term_view.search_term,
        search_term_view.status,
        campaign.id,
        campaign.name,
        ad_group.id,
        ad_group.name,
        segments.date,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.all_conversions,
        metrics.all_conversions_value
      FROM search_term_view
      WHERE segments.date >= '${dateRange.start_date}'
        AND segments.date <= '${dateRange.end_date}'
      ORDER BY metrics.cost_micros DESC
      LIMIT ${rowLimit}
    `
    const response = await googleAdsSearch(query)
    const searchTerms = (response.body?.results ?? []).map(normalizeGoogleAdsSearchTerm)
    const data = {
      ...baseData,
      http_status: response.status,
      search_term_count: searchTerms.length,
      search_terms: searchTerms
    }

    return textResult(
      createEnvelope('google_ads_search_terms_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'GOOGLE_ADS_SEARCH_TERMS_FAILED',
                response.body?.error?.message || `Google Ads search-term GAQL query failed with HTTP ${response.status}.`,
                'Verify search_term_view reporting access, customer id, login customer id, and OAuth scope.',
                'google_ads'
              )
            ],
        sources: [
          ...googleAdsSources(),
          { url: 'https://developers.google.com/google-ads/api/fields/v24/search_term_view', type: 'official-docs' }
        ],
        networkAccess: true,
        limits: { days_back: windowDays, limit: rowLimit },
        next: ['Use search terms only as reporting evidence; keyword or negative-keyword mutation is intentionally outside this tool.']
      }),
      `Google Ads search terms probe returned ${searchTerms.length} row(s).`
    )
  }
)

server.registerTool(
  'merchant_center_status_probe',
  {
    title: 'Merchant Center Status Probe',
    description: 'Run bounded read-only Google Merchant API diagnostics for data sources, account issues, aggregate product statuses, and processed products.',
    inputSchema: z.object({
      page_size: z.number().int().min(1).max(50).optional()
    }),
    outputSchema: envelopeSchema('merchant_center_status_probe', merchantCenterStatusDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ page_size: pageSize }) => {
    const startedAt = nowIso()
    const accountId = secretEnvValue('GOOGLE_MERCHANT_ACCOUNT_ID')
    const quotaProject = secretEnvValue('GOOGLE_MERCHANT_QUOTA_PROJECT') || secretEnvValue('GOOGLE_CLOUD_QUOTA_PROJECT')
    const baseData = {
      account_id: accountId || null,
      quota_project: quotaProject || null,
      api: {
        data_sources: { ok: false, status: null, count: 0 },
        account_issues: { ok: false, status: null, count: 0 },
        aggregate_product_statuses: { ok: false, status: null, count: 0 },
        products: { ok: false, status: null, count: 0 }
      },
      data_sources: [],
      account_issues: [],
      aggregate_product_statuses: [],
      products: []
    }

    if (!accountId || !quotaProject) {
      return textResult(
        createEnvelope('merchant_center_status_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'MERCHANT_CENTER_CONFIG_MISSING',
              'GOOGLE_MERCHANT_ACCOUNT_ID or quota project env is missing.',
              'Set GOOGLE_MERCHANT_ACCOUNT_ID and GOOGLE_MERCHANT_QUOTA_PROJECT, then rerun this tool.',
              'merchant_center'
            )
          ],
          next: ['Call provider_env_readiness to inspect Merchant Center credential presence.']
        }),
        'Merchant Center config is missing.'
      )
    }

    try {
      const serviceAccount = credentialJsonFor(
        ['GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON', 'MERCHANT_CENTER_CREDENTIALS_PATH'],
        ['src/api/lib/cloud-credentials/merchant-center-credentials.json']
      )
      const accountName = `accounts/${accountId}`
      const limit = pageSize ?? 25
      const [dataSourcesResponse, accountIssuesResponse, aggregateStatusesResponse, productsResponse] = await Promise.all([
        safeMerchantRequest({
          path: `/datasources/v1/${accountName}/dataSources`,
          searchParams: { pageSize: limit },
          serviceAccount,
          quotaProject
        }),
        safeMerchantRequest({
          path: `/accounts/v1/${accountName}/issues`,
          searchParams: { pageSize: limit, languageCode: 'en-US', timeZone: 'Europe/Oslo' },
          serviceAccount,
          quotaProject
        }),
        safeMerchantRequest({
          path: `/issueresolution/v1/${accountName}/aggregateProductStatuses`,
          searchParams: { pageSize: limit },
          serviceAccount,
          quotaProject
        }),
        safeMerchantRequest({
          path: `/products/v1/${accountName}/products`,
          searchParams: { pageSize: limit },
          serviceAccount,
          quotaProject
        })
      ])
      const dataSources = (dataSourcesResponse.body?.dataSources ?? []).map(normalizeMerchantDataSource)
      const accountIssues = (accountIssuesResponse.body?.accountIssues ?? []).map(normalizeMerchantAccountIssue)
      const aggregateStatuses = (aggregateStatusesResponse.body?.aggregateProductStatuses ?? []).map(normalizeMerchantAggregateStatus)
      const products = (productsResponse.body?.products ?? []).map(normalizeMerchantProduct)
      const data = {
        account_id: accountId,
        quota_project: quotaProject,
        api: {
          data_sources: { ok: dataSourcesResponse.ok, status: dataSourcesResponse.status, count: dataSources.length },
          account_issues: { ok: accountIssuesResponse.ok, status: accountIssuesResponse.status, count: accountIssues.length },
          aggregate_product_statuses: { ok: aggregateStatusesResponse.ok, status: aggregateStatusesResponse.status, count: aggregateStatuses.length },
          products: { ok: productsResponse.ok, status: productsResponse.status, count: products.length }
        },
        data_sources: dataSources,
        account_issues: accountIssues,
        aggregate_product_statuses: aggregateStatuses,
        products
      }
      const ok = dataSourcesResponse.ok && accountIssuesResponse.ok && aggregateStatusesResponse.ok && productsResponse.ok

      return textResult(
        createEnvelope('merchant_center_status_probe', startedAt, data, {
          ok,
          errors:
            ok ?
              []
            : [
                makeError(
                  'MERCHANT_CENTER_PARTIAL_FAILURE',
                  'At least one Merchant API read endpoint failed.',
                  'Check Merchant developer registration, quota project IAM, service account access, and API enablement.',
                  'merchant_center'
                )
              ],
          sources: [
            { url: 'https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.products', type: 'official-docs' },
            { path: 'src/lib/google/merchant-center/status/getMerchantCenterStatus.ts', type: 'local-reference' }
          ],
          networkAccess: true,
          limits: { page_size: limit },
          next: ['If any endpoint failed, inspect provider_env_readiness and Merchant Center API access before claiming provider health.']
        }),
        `Merchant Center probe read ${products.length} product(s), ${accountIssues.length} account issue(s).`
      )
    } catch (error) {
      return textResult(
        createEnvelope('merchant_center_status_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'MERCHANT_CENTER_STATUS_FAILED',
              error instanceof Error ? error.message : 'Merchant Center status failed.',
              'Verify service account credentials and Merchant Center API access.',
              'merchant_center'
            )
          ],
          sources: [{ url: 'https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.products', type: 'official-docs' }],
          networkAccess: true,
          next: ['Call provider_env_readiness to confirm Merchant credential presence.']
        }),
        'Merchant Center status probe failed with structured error.'
      )
    }
  }
)

server.registerTool(
  'gtm_sgtm_endpoint_status_probe',
  {
    title: 'GTM sGTM Endpoint Status Probe',
    description: 'Read public first-party sGTM/GTM endpoint statuses for Utekos without mutating GTM or Cookiebot configuration.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('gtm_sgtm_endpoint_status_probe', gtmSgtmEndpointStatusDataSchema),
    annotations: liveReadAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const origin = normalizeBaseUrl(secretEnvValue('NEXT_PUBLIC_TRACKING_SGTM_ORIGIN') || 'https://cloud.server.utekos.no')
    const gtmId = secretEnvValue('NEXT_PUBLIC_GOOGLE_GTM_ID') || 'GTM-5TWMJQFP'
    const canonicalGoogleTagId = secretEnvValue('CANONICAL_GOOGLE_TAG_ID') || 'GT-MKRLF5WK'
    const endpoints = await Promise.all([
      probeHttpEndpoint('sGTM health', `${origin}/healthy`),
      probeHttpEndpoint('GTM web container loader', `${origin}/gtm.js?id=${encodeURIComponent(gtmId)}`),
      probeHttpEndpoint('GTM noscript iframe', `${origin}/ns.html?id=${encodeURIComponent(gtmId)}`),
      probeHttpEndpoint('Canonical Google tag destination', `${origin}/gtag/js?id=${encodeURIComponent(canonicalGoogleTagId)}`)
    ])
    const data = {
      origin,
      gtm_id: gtmId,
      canonical_google_tag_id: canonicalGoogleTagId,
      endpoints
    }
    const ok = endpoints.every(endpoint => endpoint.ok)

    return textResult(
      createEnvelope('gtm_sgtm_endpoint_status_probe', startedAt, data, {
        ok,
        errors:
          ok ?
            []
          : [
              makeError(
                'GTM_SGTM_ENDPOINT_STATUS_FAILED',
                'One or more public sGTM/GTM endpoints failed.',
                'Verify that the live server container still has a built-in gtm_client with the required allowedContainerIds. Cookiebot consent signals must remain a separate custom client. Then verify publication, DNS, and canonical IDs.',
                'google_tag_manager'
              )
            ],
        sources: [
          { path: 'src/lib/tracking/server-side-tagging.md', type: 'local-reference' },
          { path: 'scripts/tracking/verify-production-tracking.sh', type: 'local-reference' }
        ],
        networkAccess: true,
        next: ['This proves public endpoint reachability only; use GTM Preview/API before claiming tag firing correctness.']
      }),
      `sGTM endpoint probe checked ${endpoints.length} endpoint(s).`
    )
  }
)

server.registerTool(
  'meta_dataset_quality_probe',
  {
    title: 'Meta Dataset Quality Probe',
    description: 'Read Meta Dataset Quality API metrics for the configured Pixel/Dataset. Does not send events or mutate Meta assets.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('meta_dataset_quality_probe', metaDatasetQualityDataSchema),
    annotations: liveReadAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const token = secretEnvValue('META_ACCESS_TOKEN') || secretEnvValue('META_SYSTEM_USER_TOKEN') || secretEnvValue('CATALOG_ACCESS_TOKEN')
    const pixelId = secretEnvValue('META_PIXEL_ID') || secretEnvValue('NEXT_PUBLIC_META_PIXEL_ID')
    const graphVersion = secretEnvValue('META_API_VERSION') || 'v25.0'
    const baseData = {
      pixel_id: pixelId || null,
      graph_version: graphVersion,
      http_status: null,
      event_count: 0,
      events: []
    }

    if (!token || !pixelId) {
      return textResult(
        createEnvelope('meta_dataset_quality_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'META_DATASET_QUALITY_CONFIG_MISSING',
              'META_ACCESS_TOKEN or META_SYSTEM_USER_TOKEN and META_PIXEL_ID/NEXT_PUBLIC_META_PIXEL_ID are required for Meta Dataset Quality reads.',
              'Set Meta token and pixel id with Dataset Quality access, then rerun this tool.',
              'meta'
            )
          ],
          sources: [
            { path: 'docs/meta/dataset-quality-api.md', type: 'local-docs' },
            { path: 'src/lib/tracking/meta/insights/syncMetaInsightsAndQuality.ts', type: 'local-reference' }
          ],
          networkAccess: true,
          next: ['Call provider_env_readiness to confirm Meta credential presence.']
        }),
        'Meta Dataset Quality config is missing.'
      )
    }

    const url = new URL(`https://graph.facebook.com/${graphVersion}/dataset_quality`)
    url.searchParams.set('dataset_id', pixelId)
    url.searchParams.set('fields', 'web{event_name,event_match_quality,event_coverage,dedupe_key_feedback,data_freshness}')
    url.searchParams.set('access_token', token)
    const response = await readJsonEndpoint(url.toString(), {
      method: 'GET'
    })
    const events = (response.body?.web ?? []).map(normalizeMetaDatasetQualityEvent)
    const data = {
      pixel_id: pixelId,
      graph_version: graphVersion,
      http_status: response.status,
      event_count: events.length,
      events
    }

    return textResult(
      createEnvelope('meta_dataset_quality_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'META_DATASET_QUALITY_FAILED',
                response.body?.error?.message || `Meta Dataset Quality query failed with HTTP ${response.status}.`,
                'Verify token validity, Pixel/Dataset access, app permissions, and Marketing API access tier.',
                'meta'
              )
            ],
        sources: [
          { path: 'docs/meta/dataset-quality-api.md', type: 'local-docs' },
          { path: 'src/lib/tracking/meta/insights/syncMetaInsightsAndQuality.ts', type: 'local-reference' }
        ],
        networkAccess: true,
        next: ['Use this as Meta quality evidence only; it does not prove browser Pixel or CAPI dispatch happened in the current session.']
      }),
      `Meta Dataset Quality probe returned ${events.length} event quality row(s).`
    )
  }
)

server.registerTool(
  'microsoft_uet_endpoint_status_probe',
  {
    title: 'Microsoft UET Endpoint Status Probe',
    description: 'Read public Microsoft UET browser loader/action endpoint statuses for the configured UET tag. Does not send conversion events.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('microsoft_uet_endpoint_status_probe', microsoftUetEndpointStatusDataSchema),
    annotations: liveReadAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const tagId =
      secretEnvValue('MICROSOFT_UET_TAG_ID')
      || secretEnvValue('UTEKOS_MICROSOFT_TAG_ID')
      || secretEnvValue('NEXT_PUBLIC_MICROSOFT_UET_TAG_ID')
      || '97247724'
    const endpoints = await Promise.all([
      probeHttpEndpoint('Microsoft UET browser tag', 'https://bat.bing.com/bat.js'),
      probeHttpEndpoint('Microsoft UET action loader', `https://bat.bing.com/p/action/${encodeURIComponent(tagId)}.js`)
    ])
    const data = {
      tag_id: tagId,
      endpoints
    }
    const ok = endpoints.every(endpoint => endpoint.ok)

    return textResult(
      createEnvelope('microsoft_uet_endpoint_status_probe', startedAt, data, {
        ok,
        errors:
          ok ?
            []
          : [
              makeError(
                'MICROSOFT_UET_ENDPOINT_STATUS_FAILED',
                'One or more Microsoft UET public endpoints failed.',
                'Verify UET tag id and public Microsoft endpoint reachability.',
                'microsoft_uet'
              )
            ],
        sources: [
          { path: 'src/lib/tracking/server-side-tagging.md', type: 'local-reference' },
          { path: 'src/lib/tracking/microsoft-uet/trackMicrosoftUetEvent.ts', type: 'local-reference' }
        ],
        networkAccess: true,
        next: ['This proves loader reachability only; use browser/network and Microsoft dashboard/API checks before claiming event registration.']
      }),
      `Microsoft UET endpoint probe checked ${endpoints.length} endpoint(s).`
    )
  }
)

server.registerTool(
  'microsoft_ads_auth_readiness_probe',
  {
    title: 'Microsoft Ads Auth Readiness Probe',
    description: 'Validate presence-only Microsoft Advertising OAuth/MFA requirements: msads.manage, developer token, CustomerId, AccountId, access token, and refresh-token handling. Does not call provider write APIs.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('microsoft_ads_auth_readiness_probe', microsoftAdsAuthReadinessDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const config = microsoftAdsConfig()
    const missing = microsoftAdsMissingRequirements({ requireCustomerId: true, requireAccountId: true })
    const data = {
      environment: config.environment,
      oauth_scope_required: 'msads.manage',
      developer_token_present: Boolean(config.developerToken),
      client_id_present: Boolean(config.clientId),
      client_secret_present: Boolean(config.clientSecret),
      access_token_present: Boolean(config.accessToken),
      refresh_token_present: Boolean(config.refreshToken),
      customer_id: config.customerId || null,
      account_id: config.accountId || null,
      parsed_access_token: config.parsedAccessToken,
      missing_requirements: missing
    }

    return textResult(
      createEnvelope('microsoft_ads_auth_readiness_probe', startedAt, data, {
        ok: missing.length === 0,
        errors:
          missing.length === 0 ?
            []
          : [
              makeError(
                'MICROSOFT_ADS_AUTH_INCOMPLETE',
                `Microsoft Advertising auth is incomplete: ${missing.join(', ')}.`,
                'Complete MFA-compliant OAuth with msads.manage, store refresh-token handling locally, and set developer token, CustomerId, and AccountId.',
                'microsoft_ads'
              )
            ],
        sources: microsoftAdsSources(),
        next: ['Only treat Microsoft Ads as OK after this probe and the account/campaign read probes return ok=true.']
      }),
      missing.length === 0 ? 'Microsoft Advertising auth prerequisites are present.' : 'Microsoft Advertising auth prerequisites are incomplete.'
    )
  }
)

server.registerTool(
  'microsoft_ads_account_access_probe',
  {
    title: 'Microsoft Ads Account Access Probe',
    description: 'Run a read-only Microsoft Advertising Customer Management GetUser probe to verify OAuth/developer-token account access. Does not mutate Ads state.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('microsoft_ads_account_access_probe', microsoftAdsReadProbeDataSchema),
    annotations: liveReadAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const missing = microsoftAdsMissingRequirements({})
    const endpoint = microsoftAdsEndpoint('customer')
    const baseData = {
      ...microsoftAdsBaseFields(),
      endpoint,
      http_status: null,
      auth_ready: missing.length === 0,
      verified: false,
      response_summary: {
        body_present: false,
        fault_code: null,
        fault_message: null,
        item_count: null
      },
      missing_requirements: missing
    }

    if (missing.length > 0) {
      return microsoftAdsConfigMissingResult('microsoft_ads_account_access_probe', startedAt, baseData, missing, microsoftAdsSources(), [
        'Run microsoft_ads_auth_readiness_probe after credentials are configured.'
      ])
    }

    const response = await safeMicrosoftAdsSoapRequest({
      service: 'customer',
      action: 'GetUser',
      body: '<GetUserRequest xmlns="https://bingads.microsoft.com/Customer/v13" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><UserId i:nil="true" /></GetUserRequest>'
    })
    const summary = summarizeMicrosoftXml(response.body, [/<User\b/gi])
    const data = {
      ...baseData,
      endpoint: response.endpoint,
      http_status: response.status,
      verified: response.ok && !summary.fault_code,
      response_summary: summary
    }

    return textResult(
      createEnvelope('microsoft_ads_account_access_probe', startedAt, data, {
        ok: data.verified,
        errors:
          data.verified ?
            []
          : [
              makeError(
                'MICROSOFT_ADS_ACCOUNT_ACCESS_FAILED',
                summary.fault_message || `Microsoft Advertising account access probe failed with HTTP ${response.status}.`,
                'Verify OAuth token, developer token, MFA compliance, CustomerId/AccountId, and user account access.',
                'microsoft_ads'
              )
            ],
        sources: microsoftAdsSources(),
        networkAccess: true,
        next: ['Run microsoft_ads_campaign_status_probe before claiming Microsoft campaign status coverage.']
      }),
      data.verified ? 'Microsoft Advertising account access verified.' : 'Microsoft Advertising account access failed.'
    )
  }
)

server.registerTool(
  'microsoft_ads_campaign_status_probe',
  {
    title: 'Microsoft Ads Campaign Status Probe',
    description: 'Run a bounded read-only Microsoft Advertising Campaign Management GetCampaignsByAccountId probe. Does not mutate campaigns, bids, budgets, or conversion goals.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('microsoft_ads_campaign_status_probe', microsoftAdsSurfaceProbeDataSchema),
    annotations: liveReadAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const config = microsoftAdsConfig()
    const missing = microsoftAdsMissingRequirements({ requireCustomerId: true, requireAccountId: true })
    const endpoint = microsoftAdsEndpoint('campaign')
    const baseData = {
      ...microsoftAdsBaseFields('campaign_status'),
      endpoint,
      http_status: null,
      auth_ready: missing.length === 0,
      verified: false,
      supported_reads: ['account campaigns', 'campaign status', 'campaign type'],
      response_summary: {
        body_present: false,
        fault_code: null,
        fault_message: null,
        item_count: null
      },
      missing_requirements: missing
    }

    if (missing.length > 0) {
      return microsoftAdsConfigMissingResult('microsoft_ads_campaign_status_probe', startedAt, baseData, missing, microsoftAdsSources())
    }

    const response = await safeMicrosoftAdsSoapRequest({
      service: 'campaign',
      action: 'GetCampaignsByAccountId',
      body: `<GetCampaignsByAccountIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13"><AccountId>${config.accountId}</AccountId></GetCampaignsByAccountIdRequest>`
    })
    const summary = summarizeMicrosoftXml(response.body, [/<Campaign\b/gi])
    const data = {
      ...baseData,
      endpoint: response.endpoint,
      http_status: response.status,
      verified: response.ok && !summary.fault_code,
      response_summary: summary
    }

    return textResult(
      createEnvelope('microsoft_ads_campaign_status_probe', startedAt, data, {
        ok: data.verified,
        errors:
          data.verified ?
            []
          : [
              makeError(
                'MICROSOFT_ADS_CAMPAIGN_STATUS_FAILED',
                summary.fault_message || `Microsoft Advertising campaign status probe failed with HTTP ${response.status}.`,
                'Verify CustomerId/AccountId, Campaign Management API access, and OAuth/developer-token configuration.',
                'microsoft_ads'
              )
            ],
        sources: microsoftAdsSources(),
        networkAccess: true,
        next: ['Use campaign status with UET/conversion goal checks before judging Microsoft Ads health.']
      }),
      data.verified ? 'Microsoft Advertising campaign status read verified.' : 'Microsoft Advertising campaign status read failed.'
    )
  }
)

server.registerTool(
  'microsoft_ads_ad_insight_probe',
  {
    title: 'Microsoft Ads Ad Insight Probe',
    description: 'Run a read-only Microsoft Advertising Ad Insight opportunity probe for budget/opportunity coverage. Does not apply recommendations or mutate bids/budgets.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('microsoft_ads_ad_insight_probe', microsoftAdsSurfaceProbeDataSchema),
    annotations: liveReadAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const config = microsoftAdsConfig()
    const missing = microsoftAdsMissingRequirements({ requireCustomerId: true, requireAccountId: true })
    const endpoint = microsoftAdsEndpoint('adInsight')
    const baseData = {
      ...microsoftAdsBaseFields('ad_insight'),
      endpoint,
      http_status: null,
      auth_ready: missing.length === 0,
      verified: false,
      supported_reads: ['keyword ideas', 'bid opportunities', 'budget opportunities', 'responsive search ad opportunities'],
      response_summary: {
        body_present: false,
        fault_code: null,
        fault_message: null,
        item_count: null
      },
      missing_requirements: missing
    }

    if (missing.length > 0) {
      return microsoftAdsConfigMissingResult('microsoft_ads_ad_insight_probe', startedAt, baseData, missing, microsoftAdsSources())
    }

    const response = await safeMicrosoftAdsSoapRequest({
      service: 'adInsight',
      action: 'GetBudgetOpportunities',
      body: `<GetBudgetOpportunitiesRequest xmlns="https://bingads.microsoft.com/AdInsight/v13"><AccountId>${config.accountId}</AccountId></GetBudgetOpportunitiesRequest>`
    })
    const summary = summarizeMicrosoftXml(response.body, [/<BudgetOpportunity\b/gi, /<Opportunity\b/gi])
    const data = {
      ...baseData,
      endpoint: response.endpoint,
      http_status: response.status,
      verified: response.ok && !summary.fault_code,
      response_summary: summary
    }

    return textResult(
      createEnvelope('microsoft_ads_ad_insight_probe', startedAt, data, {
        ok: data.verified,
        errors:
          data.verified ?
            []
          : [
              makeError(
                'MICROSOFT_ADS_AD_INSIGHT_FAILED',
                summary.fault_message || `Microsoft Advertising Ad Insight probe failed with HTTP ${response.status}.`,
                'Verify Ad Insight API access and account eligibility. This probe must never auto-apply opportunities.',
                'microsoft_ads'
              )
            ],
        sources: microsoftAdsSources(),
        networkAccess: true,
        next: ['Treat opportunities as diagnostics only; applying recommendations requires separate explicit approval.']
      }),
      data.verified ? 'Microsoft Advertising Ad Insight read verified.' : 'Microsoft Advertising Ad Insight read failed.'
    )
  }
)

server.registerTool(
  'microsoft_shopping_content_status_probe',
  {
    title: 'Microsoft Shopping Content Status Probe',
    description: 'Run a read-only Microsoft Shopping Content API product/status probe for the configured Merchant Center store. Does not mutate store, catalog, or products.',
    inputSchema: z.object({
      max_results: z.number().int().min(1).max(50).optional()
    }),
    outputSchema: envelopeSchema('microsoft_shopping_content_status_probe', microsoftAdsSurfaceProbeDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ max_results: maxResults }) => {
    const startedAt = nowIso()
    const config = microsoftAdsConfig()
    const missing = microsoftAdsMissingRequirements({ requireCustomerId: true, requireAccountId: true, requireMerchantStoreId: true })
    const endpoint = `${microsoftAdsEndpoint('shopping')}/${encodeURIComponent(config.merchantCenterStoreId || 'missing')}/products`
    const baseData = {
      ...microsoftAdsBaseFields('shopping_content'),
      endpoint,
      http_status: null,
      auth_ready: missing.length === 0,
      verified: false,
      supported_reads: ['store access', 'catalog/product list', 'product status'],
      response_summary: {
        body_present: false,
        fault_code: null,
        fault_message: null,
        item_count: null
      },
      missing_requirements: missing
    }

    if (missing.length > 0) {
      return microsoftAdsConfigMissingResult('microsoft_shopping_content_status_probe', startedAt, baseData, missing, microsoftShoppingSources(), [
        'Set MICROSOFT_MERCHANT_CENTER_STORE_ID separately from MICROSOFT_ADS_ACCOUNT_ID.'
      ])
    }

    const accessToken = await microsoftAdsAccessToken()
    const url = new URL(endpoint)
    url.searchParams.set('max-results', String(maxResults ?? 10))
    const response = await readJsonEndpoint(url.toString(), {
      method: 'GET',
      headers: {
        AuthenticationToken: accessToken,
        DeveloperToken: config.developerToken,
        CustomerId: config.customerId,
        CustomerAccountId: config.accountId,
        Accept: 'application/json'
      }
    })
    const itemCount = Array.isArray(response.body?.resources) ? response.body.resources.length
      : Array.isArray(response.body?.entries) ? response.body.entries.length
      : Array.isArray(response.body?.items) ? response.body.items.length
      : null
    const faultMessage = response.body?.error?.message || response.body?.errors?.[0]?.message || null
    const data = {
      ...baseData,
      http_status: response.status,
      verified: response.ok,
      response_summary: {
        body_present: Boolean(response.body),
        fault_code: response.body?.error?.code || response.body?.errors?.[0]?.code || null,
        fault_message: faultMessage,
        item_count: itemCount
      }
    }

    return textResult(
      createEnvelope('microsoft_shopping_content_status_probe', startedAt, data, {
        ok: data.verified,
        errors:
          data.verified ?
            []
          : [
              makeError(
                'MICROSOFT_SHOPPING_CONTENT_FAILED',
                faultMessage || `Microsoft Shopping Content probe failed with HTTP ${response.status}.`,
                'Verify Microsoft Merchant Center store id, catalog access, OAuth token, developer token, CustomerId, and AccountId.',
                'microsoft_ads'
              )
            ],
        sources: microsoftShoppingSources(),
        networkAccess: true,
        limits: { max_results: maxResults ?? 10 },
        next: ['Use this only as read evidence. Catalog/product mutations require separate explicit approval.']
      }),
      data.verified ? 'Microsoft Shopping Content status read verified.' : 'Microsoft Shopping Content status read failed.'
    )
  }
)

server.registerTool(
  'microsoft_clarity_ads_status_probe',
  {
    title: 'Microsoft Clarity Ads Status Probe',
    description: 'Check Microsoft Clarity advertising readiness: Clarity API token/project id, UET-Clarity linkage requirement, Advertising Dashboard requirement, and Consent API V2 storage flags.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('microsoft_clarity_ads_status_probe', microsoftClarityAdsStatusDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const clarityProjectId = secretEnvValue('MICROSOFT_CLARITY_PROJECT_ID') || secretEnvValue('NEXT_PUBLIC_CLARITY_PROJECT_ID')
    const clarityToken = secretEnvValue('CLARITY_API_TOKEN')
    const tagId =
      secretEnvValue('MICROSOFT_UET_TAG_ID')
      || secretEnvValue('UTEKOS_MICROSOFT_TAG_ID')
      || secretEnvValue('NEXT_PUBLIC_MICROSOFT_UET_TAG_ID')
    const missing = []
    if (!clarityProjectId) missing.push('MICROSOFT_CLARITY_PROJECT_ID|NEXT_PUBLIC_CLARITY_PROJECT_ID')
    if (!clarityToken) missing.push('CLARITY_API_TOKEN')
    if (!tagId) missing.push('MICROSOFT_UET_TAG_ID|NEXT_PUBLIC_MICROSOFT_UET_TAG_ID')
    const data = {
      clarity_project_id: clarityProjectId || null,
      clarity_api_token_present: Boolean(clarityToken),
      uet_tag_id: tagId || null,
      uet_clarity_linkage_required: true,
      advertising_dashboard_required: true,
      consent_api_v2_required: true,
      consent_storage_flags: ['ad_Storage', 'analytics_Storage'],
      status: missing.length === 0 ? 'ready_for_live_probe' : 'implemented_config_missing',
      missing_requirements: missing
    }

    return textResult(
      createEnvelope('microsoft_clarity_ads_status_probe', startedAt, data, {
        ok: missing.length === 0,
        errors:
          missing.length === 0 ?
            []
          : [
              makeError(
                'MICROSOFT_CLARITY_CONFIG_MISSING',
                `Microsoft Clarity advertising readiness is incomplete: ${missing.join(', ')}.`,
                'Set Clarity project/API credentials and verify UET-Clarity linkage plus Consent API V2 ad_Storage/analytics_Storage behavior in browser smoke.',
                'microsoft_clarity'
              )
            ],
        sources: microsoftClaritySources(),
        next: ['Browser smoke must verify Clarity Consent API V2 receives ad_Storage and analytics_Storage according to Cookiebot consent.']
      }),
      missing.length === 0 ? 'Microsoft Clarity ads readiness prerequisites are present.' : 'Microsoft Clarity ads readiness prerequisites are incomplete.'
    )
  }
)

server.registerTool(
  'gtm_api_workspace_probe',
  {
    title: 'GTM API Workspace Probe',
    description: 'Read Google Tag Manager account/container workspace metadata through GTM API v2 when OAuth access token and API account/container ids are configured. Does not preview, publish, or mutate GTM.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('gtm_api_workspace_probe', gtmApiWorkspaceDataSchema),
    annotations: liveReadAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const accountId = secretEnvValue('GTM_WEB_ACCOUNT_ID') || secretEnvValue('GTM_ACCOUNT_ID')
    const configuredContainerId = secretEnvValue('GTM_WEB_CONTAINER_ID') || secretEnvValue('GTM_CONTAINER_ID')
    const workspaceId = secretEnvValue('GTM_WEB_WORKSPACE_ID') || secretEnvValue('GTM_WORKSPACE_ID')
    const publicContainerId = secretEnvValue('GTM_WEB_PUBLIC_CONTAINER_ID') || secretEnvValue('NEXT_PUBLIC_GOOGLE_GTM_ID') || 'GTM-5TWMJQFP'
    const baseData = {
      account_id: accountId || null,
      container_id: configuredContainerId || null,
      workspace_id: workspaceId || null,
      public_container_id: publicContainerId,
      http_status: null,
      workspaces: []
    }

    if (!accountId) {
      return textResult(
        createEnvelope('gtm_api_workspace_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'GTM_API_CONFIG_MISSING',
              'GTM_WEB_ACCOUNT_ID or GTM_ACCOUNT_ID is required for authenticated GTM API reads.',
              'Set numeric GTM web account id, then rerun this tool.',
              'google_tag_manager'
            )
          ],
          sources: [
            { url: 'https://developers.google.com/tag-platform/tag-manager/api/v2', type: 'official-docs' },
            { url: 'https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces', type: 'official-docs' }
          ],
          networkAccess: true,
          next: ['This tool intentionally does not call quick_preview, create_version, or publish operations.']
        }),
        'Authenticated GTM API config is missing.'
      )
    }

    let token = ''
    let containerId = configuredContainerId
    let response
    try {
      token = await googleTagManagerAccessToken()
      if (!token) throw new Error('Missing GTM OAuth token or service-account credentials.')
      containerId = await resolveGtmContainerId({ token, accountId, configuredContainerId, publicContainerId })
      if (!containerId) throw new Error('GTM_WEB_CONTAINER_ID or GTM_CONTAINER_ID is missing and no matching container was found for the public GTM id.')

      const url = new URL(`https://www.googleapis.com/tagmanager/v2/accounts/${encodeURIComponent(accountId)}/containers/${encodeURIComponent(containerId)}/workspaces`)
      response = await readJsonEndpoint(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      return textResult(
        createEnvelope('gtm_api_workspace_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'GTM_API_CONFIG_MISSING',
              error instanceof Error ? error.message : 'GTM API authentication failed.',
              'Provide GTM_SERVICE_ACCOUT/GTM_SERVICE_ACCOUNT/GTM_SERVICE_ACCOUNT_JSON_PATH/GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON or GTM_ACCESS_TOKEN, plus GTM_WEB_ACCOUNT_ID and either numeric GTM_WEB_CONTAINER_ID or public NEXT_PUBLIC_GOOGLE_GTM_ID.',
              'google_tag_manager'
            )
          ],
          sources: [
            { url: 'https://developers.google.com/tag-platform/tag-manager/api/v2', type: 'official-docs' },
            { url: 'https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces', type: 'official-docs' }
          ],
          networkAccess: true,
          next: ['This tool intentionally does not call quick_preview, create_version, or publish operations.']
        }),
        'Authenticated GTM API config is missing.'
      )
    }
    const workspaces = (response.body?.workspace ?? []).map(normalizeGtmWorkspace)
    const data = {
      ...baseData,
      container_id: containerId || null,
      http_status: response.status,
      workspaces
    }

    return textResult(
      createEnvelope('gtm_api_workspace_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'GTM_API_WORKSPACE_FAILED',
                response.body?.error?.message || `GTM API workspace query failed with HTTP ${response.status}.`,
                'Verify GTM OAuth token scopes and numeric GTM account/container ids.',
                'google_tag_manager'
              )
            ],
        sources: [
          { url: 'https://developers.google.com/tag-platform/tag-manager/api/v2', type: 'official-docs' },
          { url: 'https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces', type: 'official-docs' }
        ],
        networkAccess: true,
        next: ['Use public sGTM endpoint checks plus browser/GTM Preview before claiming tag firing correctness.']
      }),
      `GTM API workspace probe returned ${workspaces.length} workspace(s).`
    )
  }
)

server.registerTool(
  'posthog_project_discovery_probe',
  {
    title: 'PostHog Project Discovery Probe',
    description: 'Read PostHog projects for the configured organization using the official Projects API. Use this when POSTHOG_PROJECT_ID is missing. Secret project tokens are redacted and never returned.',
    inputSchema: z.object({
      limit: z.number().int().min(1).max(50).optional(),
      search: z.string().min(1).max(120).optional()
    }),
    outputSchema: envelopeSchema('posthog_project_discovery_probe', posthogProjectDiscoveryDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ limit, search }) => {
    const startedAt = nowIso()
    const organizationId = secretEnvValue('POSTHOG_ORGANIZATION_ID') || secretEnvValue('POSTHOG_ORG_ID')
    const apiKey = secretEnvValue('POSTHOG_PERSONAL_API_KEY') || secretEnvValue('POSTHOG_CUSTOM_API_KEY') || secretEnvValue('POSTHOG_API_KEY')
    const host = normalizeBaseUrl(
      secretEnvValue('POSTHOG_API_HOST')
        || secretEnvValue('POSTHOG_HOST')
        || secretEnvValue('POSTHOG_UI_HOST')
        || secretEnvValue('NEXT_PUBLIC_POSTHOG_UI_HOST')
        || 'https://eu.posthog.com'
    )
    const baseData = {
      host,
      organization_id: organizationId || null,
      http_status: null,
      project_count: 0,
      projects: []
    }

    if (!organizationId || !apiKey) {
      return textResult(
        createEnvelope('posthog_project_discovery_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'POSTHOG_PROJECT_DISCOVERY_CONFIG_MISSING',
              'POSTHOG_ORGANIZATION_ID and a PostHog personal/query API key are required for project discovery.',
              'Set POSTHOG_ORGANIZATION_ID plus POSTHOG_PERSONAL_API_KEY or POSTHOG_CUSTOM_API_KEY with project:read access, then rerun this tool.',
              'posthog'
            )
          ],
          sources: [
            { url: 'https://posthog.com/docs/api/projects', type: 'official-docs' },
            { url: 'https://posthog.com/docs/api', type: 'official-docs' }
          ],
          networkAccess: true,
          next: ['If you already know the numeric project id, set POSTHOG_PROJECT_ID and use posthog_event_status_probe directly.']
        }),
        'PostHog organization id or API key is missing.'
      )
    }

    const url = new URL(`${host}/api/organizations/${encodeURIComponent(organizationId)}/projects/`)
    url.searchParams.set('limit', String(limit ?? 25))
    if (search) url.searchParams.set('search', search)
    const response = await readJsonEndpoint(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    const projects = (response.body?.results ?? []).map(normalizePostHogProject)
    const data = {
      ...baseData,
      http_status: response.status,
      project_count: projects.length,
      projects
    }

    return textResult(
      createEnvelope('posthog_project_discovery_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'POSTHOG_PROJECT_DISCOVERY_FAILED',
                response.body?.detail || response.body?.error?.message || `PostHog project discovery failed with HTTP ${response.status}.`,
                'Verify PostHog organization id, host, API key, and project:read scope.',
                'posthog'
              )
            ],
        sources: [
          { url: 'https://posthog.com/docs/api/projects', type: 'official-docs' },
          { url: 'https://posthog.com/docs/api', type: 'official-docs' }
        ],
        networkAccess: true,
        limits: { limit: limit ?? 25, search: search ?? null },
        next: ['Set POSTHOG_PROJECT_ID to the correct returned numeric project id, then rerun posthog_event_status_probe.']
      }),
      `PostHog project discovery returned ${projects.length} project(s).`
    )
  }
)

server.registerTool(
  'posthog_event_status_probe',
  {
    title: 'PostHog Event Status Probe',
    description: 'Read recent PostHog event counts for canonical Utekos commerce events using the official HogQL Query API. Requires a personal/project query key and project id.',
    inputSchema: z.object({
      days_back: z.number().int().min(1).max(30).optional()
    }),
    outputSchema: envelopeSchema('posthog_event_status_probe', posthogEventStatusDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ days_back: daysBack }) => {
    const startedAt = nowIso()
    const projectId = secretEnvValue('POSTHOG_PROJECT_ID') || secretEnvValue('POSTHOG_PROJECT')
    const apiKey = secretEnvValue('POSTHOG_PERSONAL_API_KEY') || secretEnvValue('POSTHOG_CUSTOM_API_KEY') || secretEnvValue('POSTHOG_API_KEY')
    const host = normalizeBaseUrl(
      secretEnvValue('POSTHOG_API_HOST')
        || secretEnvValue('POSTHOG_HOST')
        || secretEnvValue('POSTHOG_UI_HOST')
        || secretEnvValue('NEXT_PUBLIC_POSTHOG_UI_HOST')
        || 'https://eu.posthog.com'
    )
    const windowDays = daysBack ?? 7
    const baseData = {
      host,
      project_id: projectId || null,
      date_range: { days_back: windowDays },
      query_kind: 'HogQLQuery',
      events: [],
      expected_events: mapExpectedEventCoverage({})
    }

    if (!projectId || !apiKey) {
      return textResult(
        createEnvelope('posthog_event_status_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'POSTHOG_CONFIG_MISSING',
              'POSTHOG_PROJECT_ID and a PostHog personal/query API key are required for live PostHog reads.',
              'Set POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY or POSTHOG_CUSTOM_API_KEY, then rerun this tool.',
              'posthog'
            )
          ],
          sources: [
            { url: 'https://posthog.com/docs/api/query', type: 'official-docs' },
            { path: 'src/components/providers/PostHogProvider.tsx', type: 'local-reference' }
          ],
          networkAccess: true,
          next: ['Call provider_env_readiness to confirm PostHog credential presence.']
        }),
        'PostHog project id or query API key is missing.'
      )
    }

    const eventList = expectedCommerceEvents.map(eventName => `'${eventName}'`).join(', ')
    const query = `SELECT event AS event_name, count() AS event_count FROM events WHERE timestamp >= now() - INTERVAL ${windowDays} DAY AND event IN (${eventList}) GROUP BY event ORDER BY event_count DESC`
    const response = await readJsonEndpoint(`${host}/api/projects/${encodeURIComponent(projectId)}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
          name: 'utekos-commerce-event-status'
        }
      })
    })
    const events = normalizePostHogEvents(response.body)
    const data = {
      ...baseData,
      events,
      expected_events: eventCoverageFromRows(events)
    }

    return textResult(
      createEnvelope('posthog_event_status_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'POSTHOG_EVENT_STATUS_FAILED',
                response.body?.detail || response.body?.error?.message || `PostHog query failed with HTTP ${response.status}.`,
                'Verify PostHog host, project id, API key permissions, and EU/US region.',
                'posthog'
              )
            ],
        sources: [
          { url: 'https://posthog.com/docs/api/query', type: 'official-docs' },
          { url: 'https://posthog.com/docs/sql', type: 'official-docs' },
          { path: 'src/components/providers/PostHogProvider.tsx', type: 'local-reference' }
        ],
        networkAccess: true,
        limits: { days_back: windowDays, expected_event_count: expectedCommerceEvents.length },
        next: ['Use PostHog event status only as product analytics evidence, not as ad-platform conversion proof.']
      }),
      `PostHog query returned ${events.length} tracked commerce event name(s).`
    )
  }
)

server.registerTool(
  'sentry_issue_status_probe',
  {
    title: 'Sentry Issue Status Probe',
    description: 'Read unresolved Sentry issues for the configured organization/project using the Sentry REST API. Does not mutate issue state.',
    inputSchema: z.object({
      query: z.string().min(1).max(120).optional(),
      stats_period: z.string().regex(/^\d+[hdw]$/).optional(),
      limit: z.number().int().min(1).max(25).optional()
    }),
    outputSchema: envelopeSchema('sentry_issue_status_probe', sentryIssueStatusDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ query, stats_period: statsPeriod, limit }) => {
    const startedAt = nowIso()
    const token = secretEnvValue('SENTRY_AUTH_TOKEN')
    const organization = secretEnvValue('SENTRY_ORG')
    const project = secretEnvValue('SENTRY_PROJECT')
    const issueQuery = query ?? 'is:unresolved'
    const issueStatsPeriod = statsPeriod ?? '24h'
    const issueLimit = limit ?? 10
    const baseData = {
      organization: organization || null,
      project: project || null,
      query: issueQuery,
      stats_period: issueStatsPeriod,
      http_status: null,
      issue_count: 0,
      issues: []
    }

    if (!token || !organization || !project) {
      return textResult(
        createEnvelope('sentry_issue_status_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'SENTRY_CONFIG_MISSING',
              'SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT are required for live Sentry reads.',
              'Set the missing Sentry env values, then rerun this tool.',
              'sentry'
            )
          ],
          sources: [
            { url: 'https://docs.sentry.io/api/events/list-a-projects-issues/', type: 'official-docs' },
            { path: 'docs/tracing.md', type: 'local-reference' }
          ],
          networkAccess: true,
          next: ['Call provider_env_readiness to confirm Sentry credential presence.']
        }),
        'Sentry config is missing.'
      )
    }

    const url = new URL(`https://sentry.io/api/0/projects/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/issues/`)
    url.searchParams.set('query', issueQuery)
    url.searchParams.set('statsPeriod', issueStatsPeriod)
    url.searchParams.set('limit', String(issueLimit))
    const response = await readJsonEndpoint(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const issues = Array.isArray(response.body) ? response.body.map(normalizeSentryIssue) : []
    const data = {
      ...baseData,
      http_status: response.status,
      issue_count: issues.length,
      issues
    }

    return textResult(
      createEnvelope('sentry_issue_status_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'SENTRY_ISSUE_STATUS_FAILED',
                response.body?.detail || response.body?.error?.message || `Sentry issue query failed with HTTP ${response.status}.`,
                'Verify Sentry auth token scopes, org slug, project slug, and API availability.',
                'sentry'
              )
            ],
        sources: [
          { url: 'https://docs.sentry.io/api/events/list-a-projects-issues/', type: 'official-docs' },
          { url: 'https://docs.sentry.io/api/events/list-an-organizations-issues/', type: 'official-docs' },
          { path: 'docs/tracing.md', type: 'local-reference' }
        ],
        networkAccess: true,
        limits: { limit: issueLimit, stats_period: issueStatsPeriod },
        next: ['Use Sentry status as observability evidence only; it is not a marketing event collector.']
      }),
      `Sentry query returned ${issues.length} issue(s).`
    )
  }
)

server.registerTool(
  'vercel_deployment_status_probe',
  {
    title: 'Vercel Deployment Status Probe',
    description: 'Read recent Vercel deployments for the configured project using the Vercel REST API. Does not create deployments or mutate project config.',
    inputSchema: z.object({
      limit: z.number().int().min(1).max(20).optional()
    }),
    outputSchema: envelopeSchema('vercel_deployment_status_probe', vercelDeploymentStatusDataSchema),
    annotations: liveReadAnnotations
  },
  async ({ limit }) => {
    const startedAt = nowIso()
    const token = secretEnvValue('VERCEL_TOKEN')
    const projectId = secretEnvValue('VERCEL_PROJECT_ID')
    const teamId = secretEnvValue('VERCEL_TEAM_ID') || secretEnvValue('VERCEL_ORG_ID')
    const deploymentLimit = limit ?? 5
    const baseData = {
      project_id: projectId || null,
      team_id: teamId || null,
      http_status: null,
      deployment_count: 0,
      deployments: []
    }

    if (!token || !projectId) {
      return textResult(
        createEnvelope('vercel_deployment_status_probe', startedAt, baseData, {
          ok: false,
          errors: [
            makeError(
              'VERCEL_CONFIG_MISSING',
              'VERCEL_TOKEN and VERCEL_PROJECT_ID are required for live Vercel deployment reads.',
              'Set VERCEL_TOKEN and VERCEL_PROJECT_ID, plus VERCEL_TEAM_ID/VERCEL_ORG_ID when applicable, then rerun this tool.',
              'vercel'
            )
          ],
          sources: [
            { url: 'https://vercel.com/docs/rest-api/deployments/list-deployments', type: 'official-docs' },
            { path: 'vercel.json', type: 'local-reference' }
          ],
          networkAccess: true,
          next: ['Call provider_env_readiness to confirm Vercel credential presence.']
        }),
        'Vercel API config is missing.'
      )
    }

    const url = new URL('https://api.vercel.com/v6/deployments')
    url.searchParams.set('projectId', projectId)
    url.searchParams.set('limit', String(deploymentLimit))
    if (teamId) url.searchParams.set('teamId', teamId)
    const response = await readJsonEndpoint(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const deployments = (response.body?.deployments ?? []).map(normalizeVercelDeployment)
    const data = {
      ...baseData,
      http_status: response.status,
      deployment_count: deployments.length,
      deployments
    }

    return textResult(
      createEnvelope('vercel_deployment_status_probe', startedAt, data, {
        ok: response.ok,
        errors:
          response.ok ?
            []
          : [
              makeError(
                'VERCEL_DEPLOYMENT_STATUS_FAILED',
                response.body?.error?.message || `Vercel deployment query failed with HTTP ${response.status}.`,
                'Verify Vercel token permissions, project id, and team/org id.',
                'vercel'
              )
            ],
        sources: [
          { url: 'https://vercel.com/docs/rest-api/deployments/list-deployments', type: 'official-docs' },
          { url: 'https://vercel.com/docs/rest-api/projects/retrieve-a-list-of-projects', type: 'official-docs' },
          { path: 'vercel.json', type: 'local-reference' }
        ],
        networkAccess: true,
        limits: { limit: deploymentLimit },
        next: ['Use Vercel deployment status as deployment evidence only if ok is true.']
      }),
      `Vercel query returned ${deployments.length} deployment(s).`
    )
  }
)

server.registerTool(
  'tracking_architecture_inventory',
  {
    title: 'Tracking Architecture Inventory',
    description: 'Return structured local inventory for tracking endpoints, provider adapters, consent sources, and observability files.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('tracking_architecture_inventory', architectureDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const endpoints = [
      { route: '/api/tracking-events', path: 'src/app/api/tracking-events/route.ts', purpose: 'Marketing event collector' },
      { route: '/api/shopify/webhooks/orders-paid', path: 'src/app/api/shopify/webhooks/orders-paid/route.ts', purpose: 'Shopify paid-order tracking ingress' },
      { route: '/api/internal/google/merchant/status', path: 'src/app/api/internal/google/merchant/status/route.ts', purpose: 'Merchant Center status diagnostics' },
      { route: '/api/internal/google/analytics/events/status', path: 'src/app/api/internal/google/analytics/events/status/route.ts', purpose: 'GA event status diagnostics' },
      { route: '/api/cron/retry-dispatch', path: 'src/app/api/cron/retry-dispatch/route.ts', purpose: 'Provider dispatch retry' }
    ].map(item => ({ ...item, exists: fileExists(item.path) }))
    const providerAdapters = [
      { provider: 'meta', paths: ['src/lib/tracking/meta/sendMetaPurchase.ts', 'src/lib/tracking/meta/sendMetaBrowserEvent.ts', 'src/lib/tracking/meta/catalogSync.ts'] },
      { provider: 'google', paths: ['src/lib/tracking/google/sendGooglePurchase.ts', 'src/lib/tracking/google/sendGA4BrowserEvent.ts', 'src/lib/tracking/server/sendGA4Events.ts'] },
      { provider: 'microsoft_uet', paths: ['src/lib/tracking/microsoft-uet/trackMicrosoftUetEvent.ts', 'src/lib/tracking/microsoft-uet/sendMicrosoftUetPurchase.ts'] },
      { provider: 'pinterest', paths: ['src/lib/tracking/pinterest/sendPinterestPurchase.ts', 'src/lib/tracking/pinterest/sendPinterestBrowserEvent.ts'] },
      { provider: 'merchant_center', paths: ['src/lib/google/merchant-center/getMerchantApiDiagnostic.ts', 'src/lib/google/merchant-center/status/getMerchantCenterStatus.ts'] },
      { provider: 'google_ads', paths: ['src/lib/google/data-manager/dataManagerConfig.ts', 'src/lib/google/data-manager/ingestCustomerMatchSeedList.ts', 'src/lib/tracking/server-side-tagging.md'] },
      { provider: 'shopify', paths: ['src/lib/shopify/admin.ts', 'src/api/shopify/request/fetchShopify.ts'] }
    ].map(item => ({
      ...item,
      present: item.paths.some(fileExists)
    }))
    const consentSources = [
      { path: 'src/components/cookie-consent/cookiebotConfig.ts', purpose: 'Cookiebot categories and provider mapping' },
      { path: 'src/components/cookie-consent/CookiebotConsentProvider.tsx', purpose: 'Browser consent event handling' },
      { path: 'src/lib/tracking/consent/getRequestConsentState.ts', purpose: 'Server request consent extraction' },
      { path: 'src/lib/tracking/server-side-tagging.md', purpose: 'sGTM and consent architecture' }
    ].map(item => ({ ...item, exists: fileExists(item.path) }))
    const observabilitySources = [
      { path: 'sentry.server.config.ts', purpose: 'Sentry server init' },
      { path: 'sentry.edge.config.ts', purpose: 'Sentry edge init' },
      { path: 'src/instrumentation-client.ts', purpose: 'Client instrumentation' },
      { path: 'src/components/analytics/PostHogConsentGate.tsx', purpose: 'PostHog consent gate' }
    ].map(item => ({ ...item, exists: fileExists(item.path) }))
    const data = {
      endpoints,
      provider_adapters: providerAdapters,
      consent_sources: consentSources,
      observability_sources: observabilitySources
    }

    return textResult(
      createEnvelope('tracking_architecture_inventory', startedAt, data, {
        sources: [{ path: 'docs/tracing.md', type: 'architecture-doc' }, { path: 'docs/agent-context-map.md', type: 'context-map' }],
        next: ['Call tracking_event_contract to inspect event names and required payload fields.']
      }),
      `Inventoried ${endpoints.length} endpoints and ${providerAdapters.length} provider adapter groups.`
    )
  }
)

server.registerTool(
  'tracking_event_contract',
  {
    title: 'Tracking Event Contract',
    description: 'Return canonical event names, provider event names, required fields, consent gates, and dispatch providers from local tracking sources.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('tracking_event_contract', eventContractDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const schemaPath = 'src/lib/tracking/utils/trackingEventPayloadSchema.ts'
    const routePath = 'src/app/api/tracking-events/route.ts'
    const schemaSource = readText(schemaPath)
    const canonicalEventNames = [...schemaSource.matchAll(/'([a-z_]+)'/g)]
      .map(match => match[1])
      .filter(value => ['page_view', 'view_item_list', 'select_item', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'search', 'generate_lead', 'custom'].includes(value))
    const providerEventNames = extractEnumValues(schemaSource, 'trackingEventNameSchema')
    const data = {
      schema_path: schemaPath,
      route_path: routePath,
      canonical_event_names: [...new Set(canonicalEventNames)],
      provider_event_names: providerEventNames,
      required_fields: ['schemaVersion', 'classification', 'source', 'occurredAt', 'canonicalEventName', 'eventName', 'eventId'],
      consent_gates: ['Facebook Pixel', 'Google Analytics', 'Microsoft Advertising Remarketing'],
      dispatch_providers: ['meta', 'google', 'microsoft_uet']
    }

    return textResult(
      createEnvelope('tracking_event_contract', startedAt, data, {
        sources: [{ path: schemaPath, type: 'zod-schema' }, { path: routePath, type: 'route' }],
        next: ['Use browser/runtime tools to prove events actually fire before claiming provider health.']
      }),
      `Tracking contract exposes ${data.canonical_event_names.length} canonical event names.`
    )
  }
)

server.registerTool(
  'commerce_tracking_docs_map',
  {
    title: 'Commerce Tracking Docs Map',
    description: 'Return compact local documentation and source map for commerce, tracking, consent, observability, and provider diagnostics.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema('commerce_tracking_docs_map', docsMapDataSchema),
    annotations: inspectAnnotations
  },
  async () => {
    const startedAt = nowIso()
    const data = {
      docs: [
        { domain: 'tracking', paths: ['docs/tracing.md', 'src/lib/tracking/server-side-tagging.md'] },
        { domain: 'meta', paths: ['docs/meta/', 'docs/meta/Meta_ CAPI End-to-end implementation.md', 'docs/meta/dataset-quality-api.md'] },
        { domain: 'google', paths: ['docs/google/google-analytics/', 'docs/google/google-ads/', 'docs/data-manager-api/events/send-events.md', 'src/lib/google/data-manager/', 'src/lib/tracking/server-side-tagging.md'] },
        { domain: 'microsoft', paths: ['docs/microsoft/advertising-api.md', 'src/lib/tracking/microsoft-uet/', 'src/lib/tracking/server-side-tagging.md'] },
        { domain: 'merchant', paths: ['docs/merchant/README.md', 'docs/merchant/product_data_specs.md', 'docs/merchant/order_tracking_signals.md'] },
        { domain: 'consent', paths: ['docs/', 'src/components/cookie-consent/', 'src/lib/tracking/server-side-tagging.md'] },
        { domain: 'shopify', paths: ['docs/shopify/', 'docs/shopify/items-info.md'] }
      ],
      source_files: [
        { domain: 'tracking-ingress', paths: ['src/app/api/tracking-events/route.ts', 'src/lib/tracking/utils/trackingEventPayloadSchema.ts'] },
        { domain: 'warehouse', paths: ['src/lib/tracking/warehouse/'] },
        { domain: 'provider-adapters', paths: ['src/lib/tracking/meta/', 'src/lib/tracking/google/', 'src/lib/tracking/microsoft-uet/', 'src/lib/tracking/pinterest/', 'src/lib/google/data-manager/', 'docs/microsoft/advertising-api.md'] },
        { domain: 'commerce', paths: ['src/lib/shopify/', 'src/api/shopify/', 'src/lib/google/merchant-center/', 'src/lib/google/data-manager/'] },
        { domain: 'consent', paths: ['src/components/cookie-consent/', 'src/lib/tracking/consent/'] }
      ]
    }

    return textResult(
      createEnvelope('commerce_tracking_docs_map', startedAt, data, {
        sources: [{ path: 'docs/sitemap.md', type: 'docs-index' }, { path: 'docs/agent-context-map.md', type: 'context-map' }],
        next: ['Read only the domain paths relevant to the requested task before implementation.']
      }),
      'Returned commerce/tracking documentation map.'
    )
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Utekos Commerce Tracking MCP server running on stdio')
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
