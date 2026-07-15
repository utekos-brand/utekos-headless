import 'server-only'

import postgres from 'postgres'

let postgresClient: ReturnType<typeof postgres> | null | undefined

function getPostgresUrl(): string | undefined {
  return (
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING
    || process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING_MAYBE
    || process.env.SUPABASE_VERCEL_POSTGRES_URL
  )
}

export function getPostgresClient(): ReturnType<typeof postgres> | null {
  if (postgresClient !== undefined) {
    return postgresClient
  }

  const connectionUrl = getPostgresUrl()

  if (!connectionUrl) {
    postgresClient = null
    return postgresClient
  }

  postgresClient = postgres(connectionUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    connection: {
      application_name: 'utekos-app'
    }
  })

  return postgresClient
}
