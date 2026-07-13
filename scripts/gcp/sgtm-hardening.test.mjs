import assert from 'node:assert/strict'
import test from 'node:test'

import { isExplicitNotFound, verifySgtmHardeningState } from './lib/sgtm-hardening.mjs'

test('distinguishes an explicit not-found response from permission ambiguity', () => {
  assert.equal(isExplicitNotFound({ stderr: 'NOT_FOUND: Secret not found.' }), true)
  assert.equal(isExplicitNotFound({ stderr: 'PERMISSION_DENIED: resource may not exist' }), false)
  assert.equal(isExplicitNotFound({ stderr: 'network timeout' }), false)
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
  requiredAlertPolicies: [{ displayName: 'loader', condition: { conditionMatchedLog: { filter: 'status=400' } } }],
  budget: { displayName: 'Utekos GCP budget', billingAccount: 'ABC', useLastPeriodAmount: true, thresholdRules: [0.8, 1] }
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
  uptimeChecks: [{ displayName: 'sGTM healthy', monitoredResource: { labels: { host: 'cloud.server.utekos.no' } }, httpCheck: { path: '/healthy', useSsl: true }, selectedRegions: ['USA', 'EUROPE'] }],
  notificationChannels: [{ name: 'projects/project/notificationChannels/1', type: 'email', labels: { email_address: 'ops@example.com' }, enabled: true }],
  alertPolicies: [{ displayName: 'loader', enabled: true, notificationChannels: ['projects/project/notificationChannels/1'], conditions: [{ conditionMatchedLog: { filter: 'status=400' } }] }],
  budgets: [{ displayName: 'Utekos GCP budget', amount: { lastPeriodAmount: {} }, thresholdRules: [{ thresholdPercent: 1 }, { thresholdPercent: 0.8 }], notificationsRule: { monitoringNotificationChannels: ['projects/project/notificationChannels/1'] } }]
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
  const result = verifySgtmHardeningState(config, broken)

  assert.equal(result.ok, false)
  assert.match(result.failures.join('\n'), /service account/)
  assert.match(result.failures.join('\n'), /filter/)
  assert.match(result.failures.join('\n'), /notification channel/)
  assert.match(result.failures.join('\n'), /budget thresholds/)
})
