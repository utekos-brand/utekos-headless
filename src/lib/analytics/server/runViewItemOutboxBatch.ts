import {
  runGoogleDataManagerViewItemOutboxBatch,
  type GoogleDataManagerViewItemBatchSummary
} from './runGoogleDataManagerViewItemOutboxBatch'
import {
  runMetaViewItemOutboxBatch,
  type MetaViewItemBatchSummary
} from './runMetaViewItemOutboxBatch'

type RunViewItemOutboxBatchInput = { maxItems: number }

export type ViewItemOutboxBatchSummary = {
  google: GoogleDataManagerViewItemBatchSummary
  meta: MetaViewItemBatchSummary
}

export type ViewItemOutboxBatchDependencies = {
  runGoogleBatch: typeof runGoogleDataManagerViewItemOutboxBatch
  runMetaBatch: typeof runMetaViewItemOutboxBatch
}

const defaultDependencies: ViewItemOutboxBatchDependencies = {
  runGoogleBatch: runGoogleDataManagerViewItemOutboxBatch,
  runMetaBatch: runMetaViewItemOutboxBatch
}

export async function runViewItemOutboxBatch(
  input: RunViewItemOutboxBatchInput,
  dependencies: ViewItemOutboxBatchDependencies = defaultDependencies
): Promise<ViewItemOutboxBatchSummary> {
  const [meta, google] = await Promise.all([
    dependencies.runMetaBatch(input),
    dependencies.runGoogleBatch(input)
  ])

  return { google, meta }
}
