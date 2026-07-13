function stable(value) {
  if (Array.isArray(value)) return value.map(stable).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).filter(key => !['name', 'creationRecord', 'mutationRecord'].includes(key)).sort().map(key => [key, stable(value[key])]))
}

export function isExplicitNotFound(error) {
  const message = String(error?.stderr || error?.message || '')
  return /\bNOT_FOUND\b/.test(message) && !/\bPERMISSION_DENIED\b/.test(message)
}

function equal(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right))
}

function getAnnotation(service, key) {
  return service.metadata?.annotations?.[key]
}

function findEnv(container, name) {
  return (container?.env || []).find(entry => entry.name === name)?.value
}

function hasSecretMount(service, config) {
  const spec = service.spec?.template?.spec || {}
  const directory = config.mountPath.slice(0, config.mountPath.lastIndexOf('/'))
  const filename = config.mountPath.slice(config.mountPath.lastIndexOf('/') + 1)
  const volume = (spec.volumes || []).find(item => item.secret?.secretName === config.name
    && (item.secret.items || []).some(secretItem => secretItem.path === filename))
  if (!volume) return false
  return (spec.containers?.[0]?.volumeMounts || []).some(mount => mount.name === volume.name && mount.mountPath === directory)
}

function resolveExpectedAddress(notificationConfig) {
  return notificationConfig.address || process.env[notificationConfig.addressEnv]
}

function conditionMatches(actual, expected) {
  return equal(actual, expected)
}

export function verifySgtmHardeningState(config, state) {
  const failures = []
  if (config.vercel) {
    if (state.vercelLink?.projectId !== config.vercel.projectId
      || state.vercelLink?.orgId !== config.vercel.orgId
      || state.vercelLink?.projectName !== config.vercel.projectName) {
      failures.push('Vercel link does not match the approved project and team')
    }
    for (const [target, payload] of [['Preview', state.vercelPreviewEnv], ['Production', state.vercelProductionEnv]]) {
      const variables = payload?.envs || []
      if (!variables.some(variable => variable.key === config.vercel.receiptEnvKey
        && variable.type === 'sensitive'
        && (variable.target || []).includes(target.toLowerCase()))) {
        failures.push(`Vercel ${target} protected receipt env is missing`)
      }
    }
  }
  const service = state.service || {}
  const spec = service.spec?.template?.spec || {}
  const container = spec.containers?.[0]
  const min = Number(getAnnotation(service, 'run.googleapis.com/minScale') || 0)
  const max = Number(getAnnotation(service, 'run.googleapis.com/maxScale') || 0)
  if (min !== config.capacity.minInstances) failures.push(`service-level minimum is ${min}, expected ${config.capacity.minInstances}`)
  if (max !== config.capacity.maxInstances) failures.push(`service-level maximum is ${max}, expected ${config.capacity.maxInstances}`)
  if (Number(spec.containerConcurrency || 0) !== config.capacity.concurrency) failures.push('container concurrency drifted')
  if (spec.serviceAccountName !== config.serviceAccount) failures.push('dedicated service account is not configured')
  if (findEnv(container, config.secret.environmentVariable) !== config.secret.mountPath) failures.push('SGTM_CREDENTIALS env path drifted')
  if (!hasSecretMount(service, config.secret)) failures.push('Secret Manager file mount drifted')

  const member = `serviceAccount:${config.serviceAccount}`
  const hasSecretAccess = (state.secretIamPolicy?.bindings || []).some(binding =>
    binding.role === 'roles/secretmanager.secretAccessor' && (binding.members || []).includes(member))
  if (!hasSecretAccess) failures.push('service account lacks secret accessor IAM on the sGTM secret')

  const uptime = (state.uptimeChecks || []).find(check => check.displayName === config.uptime.displayName)
  const uptimeHost = uptime?.monitoredResource?.labels?.host
  if (!uptime
    || uptimeHost !== config.uptime.host
    || uptime.httpCheck?.path !== config.uptime.path
    || uptime.httpCheck?.useSsl !== true
    || !equal(uptime.selectedRegions || [], config.uptime.selectedRegions)) failures.push('healthy uptime host, path, TLS or regions drifted')

  const expectedAddress = resolveExpectedAddress(config.notificationChannel)
  const channel = (state.notificationChannels || []).find(item => item.type === config.notificationChannel.type
    && item.enabled !== false
    && item.labels?.email_address === expectedAddress)
  if (!channel) failures.push('approved notification channel is missing or disabled')

  for (const metric of config.loggingMetrics || []) {
    const actual = (state.loggingMetrics || []).find(item => item.name?.endsWith(`/metrics/${metric.name}`))
    if (!actual || actual.filter !== metric.filter || actual.metricDescriptor?.metricKind !== metric.metricKind) {
      failures.push(`logging metric ${metric.name} filter or kind drifted`)
    }
  }

  for (const expected of config.requiredAlertPolicies) {
    const actual = (state.alertPolicies || []).find(policy => policy.displayName === expected.displayName)
    if (!actual || actual.enabled === false) {
      failures.push(`alert policy ${expected.displayName} is missing or disabled`)
      continue
    }
    if (!channel?.name || !(actual.notificationChannels || []).includes(channel.name)) {
      failures.push(`alert policy ${expected.displayName} lacks the approved notification channel`)
    }
    if ((actual.conditions || []).length !== 1 || !conditionMatches(actual.conditions[0], expected.condition)) {
      failures.push(`alert policy ${expected.displayName} filter, threshold or duration drifted`)
    }
  }

  const budget = (state.budgets || []).find(item => item.displayName === config.budget.displayName)
  const thresholds = (budget?.thresholdRules || []).map(rule => Number(rule.thresholdPercent)).sort()
  const expectedThresholds = [...config.budget.thresholdRules].sort()
  if (!budget || (config.budget.useLastPeriodAmount && !budget.amount?.lastPeriodAmount)
    || !equal(thresholds, expectedThresholds)) failures.push('budget thresholds or amount basis drifted')
  if (channel?.name && !(budget?.notificationsRule?.monitoringNotificationChannels || []).includes(channel.name)) {
    failures.push('budget lacks the approved notification channel')
  }

  return { ok: failures.length === 0, failures }
}
