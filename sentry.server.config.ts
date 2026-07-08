import * as Sentry from '@sentry/nextjs'

const dsn =
  process.env.NEXT_PUBLIC_PERFORMANCE_SENTRY_DSN
  ?? process.env.NEXT_PUBLIC_SENTRY_DSN
const isProduction = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  integrations: [],
  sendDefaultPii: false,
  enableLogs: true,
  tracesSampleRate: isProduction ? 0.1 : 1
})
