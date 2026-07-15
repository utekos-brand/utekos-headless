import * as Sentry from '@sentry/nextjs'
import { getVercelRuntimeContext } from '@/lib/runtime/getVercelRuntimeContext'

const dsn =
  process.env.NEXT_PUBLIC_PERFORMANCE_SENTRY_DSN
  ?? process.env.NEXT_PUBLIC_SENTRY_DSN
const runtime = getVercelRuntimeContext()

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: runtime.environment,
  release: runtime.commitSha ?? undefined,
  initialScope: {
    tags: {
      vercel_region: runtime.region ?? 'unknown',
      vercel_deployment_id: runtime.deploymentId ?? 'local'
    }
  },
  sendDefaultPii: false,
  enableLogs: true,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1
})
