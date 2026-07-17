import { createGoogleDataManagerViewItemOutboxStore } from './createGoogleDataManagerViewItemOutboxStore'
import { createPostgresProviderOutboxDatabase } from './postgresProviderOutboxStore'
import type { ProviderOutboxQueryExecutor } from './postgresProviderOutboxStore'
import { googleDataManagerViewItemProviderAdapter } from './providerAdapters/googleDataManagerViewItemProviderAdapter'

export type GoogleDataManagerViewItemOutboxQueryExecutor =
  ProviderOutboxQueryExecutor

export function createPostgresGoogleDataManagerViewItemOutboxDatabase(
  executeQuery?: GoogleDataManagerViewItemOutboxQueryExecutor
) {
  return createPostgresProviderOutboxDatabase(
    googleDataManagerViewItemProviderAdapter,
    executeQuery
  )
}

export const postgresGoogleDataManagerViewItemOutboxStore =
  createGoogleDataManagerViewItemOutboxStore(
    createPostgresGoogleDataManagerViewItemOutboxDatabase()
  )
