import { googleDataManagerViewItemProviderAdapter } from './providerAdapters/googleDataManagerViewItemProviderAdapter'
import { metaViewItemProviderAdapter } from './providerAdapters/metaViewItemProviderAdapter'
import type { ProviderAdapterKey } from './providerAdapter'

export const providerAdapterRegistry = {
  'google:view_item': googleDataManagerViewItemProviderAdapter,
  'meta:view_item': metaViewItemProviderAdapter
} as const satisfies Partial<Record<ProviderAdapterKey, unknown>>

export type RegisteredProviderAdapterKey =
  keyof typeof providerAdapterRegistry

export const registeredProviderAdapterKeys = Object.freeze(
  Object.keys(
    providerAdapterRegistry
  ) as RegisteredProviderAdapterKey[]
)
