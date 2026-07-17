import type { GoogleDataManagerViewItemBatchSummary } from './runGoogleDataManagerViewItemOutboxBatch'
import type { MetaViewItemBatchSummary } from './runMetaViewItemOutboxBatch'
import { runRegisteredProviderOutboxBatch } from './runRegisteredProviderOutboxBatch'

type RunViewItemOutboxBatchInput = { maxItems: number }

export type ViewItemOutboxBatchSummary = {
  google: GoogleDataManagerViewItemBatchSummary
  meta: MetaViewItemBatchSummary
}

export type ViewItemOutboxBatchDependencies = {
  runGoogleBatch: (
    input: RunViewItemOutboxBatchInput
  ) => Promise<GoogleDataManagerViewItemBatchSummary>
  runMetaBatch: (
    input: RunViewItemOutboxBatchInput
  ) => Promise<MetaViewItemBatchSummary>
}

export async function runViewItemOutboxBatch(
  input: RunViewItemOutboxBatchInput,
  dependencies?: ViewItemOutboxBatchDependencies
): Promise<ViewItemOutboxBatchSummary> {
  if (!dependencies) {
    const summaries = await runRegisteredProviderOutboxBatch(input)

    return {
      google: summaries['google:view_item'],
      meta: summaries['meta:view_item']
    }
  }

  const [meta, google] = await Promise.all([
    dependencies.runMetaBatch(input),
    dependencies.runGoogleBatch(input)
  ])

  return { google, meta }
}
