import {
  providerOutboxWorkerRegistry
} from './providerOutboxWorkerRegistry'
import type { RegisteredProviderAdapterKey } from './providerAdapterRegistry'
import type { ProviderOutboxBatchSummary } from './runProviderOutboxWorker'

export type RegisteredProviderOutboxBatchSummary = Record<
  RegisteredProviderAdapterKey,
  ProviderOutboxBatchSummary
>

type RegisteredWorker = (input: {
  maxItems: number
}) => Promise<ProviderOutboxBatchSummary>

export type RegisteredProviderOutboxBatchDependencies = Record<
  RegisteredProviderAdapterKey,
  RegisteredWorker
>

export async function runRegisteredProviderOutboxBatch(
  input: { maxItems: number },
  dependencies: RegisteredProviderOutboxBatchDependencies =
    providerOutboxWorkerRegistry
): Promise<RegisteredProviderOutboxBatchSummary> {
  const entries = Object.entries(dependencies) as [
    RegisteredProviderAdapterKey,
    RegisteredWorker
  ][]
  const results = await Promise.all(
    entries.map(async ([key, runBatch]) => [
      key,
      await runBatch(input)
    ] as const)
  )

  return Object.fromEntries(
    results
  ) as RegisteredProviderOutboxBatchSummary
}
