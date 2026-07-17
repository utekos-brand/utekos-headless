import { createMetaViewItemOutboxStore } from './createMetaViewItemOutboxStore'
import { createPostgresProviderOutboxDatabase } from './postgresProviderOutboxStore'
import type { ProviderOutboxQueryExecutor } from './postgresProviderOutboxStore'
import { metaViewItemProviderAdapter } from './providerAdapters/metaViewItemProviderAdapter'

export type MetaViewItemOutboxQueryExecutor =
  ProviderOutboxQueryExecutor

export function createPostgresMetaViewItemOutboxDatabase(
  executeQuery?: MetaViewItemOutboxQueryExecutor
) {
  return createPostgresProviderOutboxDatabase(
    metaViewItemProviderAdapter,
    executeQuery
  )
}

export const postgresMetaViewItemOutboxStore =
  createMetaViewItemOutboxStore(
    createPostgresMetaViewItemOutboxDatabase()
  )
