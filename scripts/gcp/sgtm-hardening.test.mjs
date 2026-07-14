import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  assertApprovedVercelLink,
  decideSecretInitialization,
  isExplicitNotFound,
  verifySgtmHardeningState
} from './lib/sgtm-hardening.mjs'

const productionConfig = JSON.parse(fs.readFileSync('config/gcp/sgtm-production-hardening.json', 'utf8'))

test('distinguishes an explicit not-found response from permission ambiguity', () => {
  assert.equal(isExplicitNotFound({ stderr: 'NOT_FOUND: Secret not found.' }), true)
  assert.equal(isExplicitNotFound({ stderr: 'PERMISSION_DENIED: resource may not exist' }), false)
  assert.equal(isExplicitNotFound({ stderr: 'network timeout' }), false)
})

test('plans secret initialization without rotating a valid secret', () => {
  assert.equal(decideSecretInitialization({ secretExists: false, versions: [] }), 'create-secret-and-first-version')
  assert.equal(decideSecretInitialization({ secretExists: true, versions: [] }), 'add-first-version')
  assert.equal(decideSecretInitialization({ secretExists: true, versions: [{ state: 'ENABLED' }] }), 'reuse-latest')
  assert.throws(() => decideSecretInitialization({ secretExists: true, versions: [{ state: 'DISABLED' }] }), /enabled/)
})

test('fails the Vercel preflight on any wrong project or team target', () => {
  const expected = { projectId: 'approved-project', orgId: 'approved-team', projectName: 'utekos-headless' }
  assert.doesNotThrow(() => assertApprovedVercelLink(expected, expected))
  assert.throws(() => assertApprovedVercelLink(expected, {
    projectId: 'wrong-project', orgId: 'approved-team', projectName: 'utekos-headless'
  }), /approved project and team/)
})

test('production metrics use a total collect denominator and count raw UPD across URL and structured logs', () => {
  const metrics = new Map(productionConfig.loggingMetrics.map(metric => [metric.name, metric]))
  assert.match(metrics.get('sgtm_collect_total_count').filter, /\/g\/collect/)
  assert.match(metrics.get('sgtm_collect_400_count').filter, /httpRequest\.status=400/)
  assert.match(metrics.get('sgtm_raw_upd_count').filter, /httpRequest\.requestUrl/)
  assert.match(metrics.get('sgtm_raw_upd_count').filter, /jsonPayload/)
  const collectPolicy = productionConfig.requiredAlertPolicies.find(item => item.displayName === 'sGTM collect HTTP 400 rate above 2 percent')
  const serverErrorPolicy = productionConfig.requiredAlertPolicies.find(item => item.displayName === 'sGTM 5xx rate above 1 percent for 5 minutes')
  assert.match(collectPolicy.condition.conditionThreshold.denominatorFilter, /sgtm_collect_total_count/)
  assert.doesNotMatch(collectPolicy.condition.conditionThreshold.denominatorFilter, /run\.googleapis\.com\/request_count/)
  assert.match(serverErrorPolicy.condition.conditionThreshold.denominatorFilter, /run\.googleapis\.com\/request_count/)
  assert.doesNotMatch(serverErrorPolicy.condition.conditionThreshold.denominatorFilter, /sgtm_collect_total_count/)
})

test('production budget is scoped to the exact GCP project number', () => {
  assert.deepEqual(productionConfig.budget.filter.projects, ['projects/741353863697'])
})

const config = {
  projectId: 'project',
  region: 'europe-west1',
  service: 'gtm-server',
  serviceAccount: 'sgtm-runtime@project.iam.gserviceaccount.com',
  capacity: { minInstances: 3, maxInstances: 10, concurrency: 80 },
  secret: {
    name: 'sgtm-credentials',
    environmentVariable: 'SGTM_CREDENTIALS',
    mountPath: '/secrets/sgtm/credentials.json',
    keyId: 'receipt-key'
  },
  uptime: { displayName: 'sGTM healthy', host: 'cloud.server.utekos.no', path: '/healthy', selectedRegions: ['EUROPE', 'USA'] },
  notificationChannel: { type: 'email', address: 'ops@example.com' },
  loggingMetrics: [
    { name: 'sgtm_collect_400_count', metricKind: 'DELTA', filter: 'status=400 AND path=/g/collect' },
    { name: 'sgtm_collect_total_count', metricKind: 'DELTA', filter: 'path=/g/collect' }
  ],
  requiredAlertPolicies: [{ displayName: 'loader', condition: { conditionMatchedLog: { filter: 'status=400' } } }],
  budget: { displayName: 'Utekos GCP budget', billingAccount: 'ABC', useLastPeriodAmount: true, thresholdRules: [0.8, 1], filter: { projects: ['projects/123'] } }
}

const state = {
  service: {
    metadata: { annotations: { 'run.googleapis.com/minScale': '3', 'run.googleapis.com/maxScale': '10' } },
    spec: { template: { spec: {
      containerConcurrency: 80,
      serviceAccountName: config.serviceAccount,
      containers: [{ env: [{ name: 'SGTM_CREDENTIALS', value: '/secrets/sgtm/credentials.json' }], volumeMounts: [{ name: 'sgtm-credentials', mountPath: '/secrets/sgtm' }] }],
      volumes: [{ name: 'sgtm-credentials', secret: { secretName: 'sgtm-credentials', items: [{ key: 'latest', path: 'credentials.json' }] } }]
    } } }
  },
  secretIamPolicy: { bindings: [{ role: 'roles/secretmanager.secretAccessor', members: [`serviceAccount:${config.serviceAccount}`] }] },
  secretResource: { name: 'projects/project/secrets/sgtm-credentials' },
  secretVersion: { name: 'projects/project/secrets/sgtm-credentials/versions/1', state: 'ENABLED' },
  secretMaterialValid: true,
  uptimeChecks: [{ displayName: 'sGTM healthy', monitoredResource: { labels: { host: 'cloud.server.utekos.no' } }, httpCheck: { path: '/healthy', useSsl: true }, selectedRegions: ['USA', 'EUROPE'] }],
  notificationChannels: [{ name: 'projects/project/notificationChannels/1', type: 'email', labels: { email_address: 'ops@example.com' }, enabled: true }],
  loggingMetrics: [
    { name: 'projects/project/metrics/sgtm_collect_400_count', filter: 'status=400 AND path=/g/collect', metricDescriptor: { metricKind: 'DELTA' } },
    { name: 'projects/project/metrics/sgtm_collect_total_count', filter: 'path=/g/collect', metricDescriptor: { metricKind: 'DELTA' } }
  ],
  alertPolicies: [{ displayName: 'loader', enabled: true, notificationChannels: ['projects/project/notificationChannels/1'], conditions: [{ conditionMatchedLog: { filter: 'status=400' } }] }],
  budgets: [{ displayName: 'Utekos GCP budget', amount: { lastPeriodAmount: {} }, thresholdRules: [{ thresholdPercent: 1 }, { thresholdPercent: 0.8 }], notificationsRule: { monitoringNotificationChannels: ['projects/project/notificationChannels/1'] }, budgetFilter: { projects: ['projects/123'] } }]
}

test('verifies exact service, secret, uptime, alert and budget contracts', () => {
  assert.deepEqual(verifySgtmHardeningState(config, state), { ok: true, failures: [] })
})

test('fails closed on a display-name-only policy, wrong identity, missing channel and wrong threshold', () => {
  const broken = structuredClone(state)
  broken.service.spec.template.spec.serviceAccountName = 'default@developer.gserviceaccount.com'
  broken.alertPolicies[0].conditions[0].conditionMatchedLog.filter = 'different'
  broken.alertPolicies[0].notificationChannels = []
  broken.budgets[0].thresholdRules = [{ thresholdPercent: 0.8 }]
  broken.budgets[0].budgetFilter.projects = ['projects/wrong']
  broken.service.spec.template.spec.volumes[0].secret.items[0].key = '1'
  broken.loggingMetrics[1].filter = 'all requests'
  broken.secretVersion.state = 'DISABLED'
  broken.secretMaterialValid = false
  const result = verifySgtmHardeningState(config, broken)

  assert.equal(result.ok, false)
  assert.match(result.failures.join('\n'), /service account/)
  assert.match(result.failures.join('\n'), /filter/)
  assert.match(result.failures.join('\n'), /notification channel/)
  assert.match(result.failures.join('\n'), /budget thresholds/)
  assert.match(result.failures.join('\n'), /budget project filter/)
  assert.match(result.failures.join('\n'), /file mount/)
  assert.match(result.failures.join('\n'), /sgtm_collect_total_count filter/)
  assert.match(result.failures.join('\n'), /enabled latest version/)
  assert.match(result.failures.join('\n'), /secret material/)
})
