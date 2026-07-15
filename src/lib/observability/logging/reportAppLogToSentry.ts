import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { getVercelRuntimeContext } from '@/lib/runtime/getVercelRuntimeContext'
import type { AppLogEntry } from 'types/observability/log/AppLogEntry'

export async function reportAppLogToSentry(logEntry: AppLogEntry): Promise<void> {
  if (logEntry.level !== 'ERROR') return

  const runtime = getVercelRuntimeContext()

  Sentry.captureMessage(logEntry.event, {
    level: 'error',
    tags: {
      app_log_id: logEntry.id,
      vercel_environment: runtime.environment,
      vercel_region: runtime.region ?? 'unknown',
      vercel_deployment_id: runtime.deploymentId ?? 'local'
    },
    extra: {
      data: logEntry.data,
      context: logEntry.context,
      commitSha: runtime.commitSha
    }
  })

  await Sentry.flush(1_500)
}
