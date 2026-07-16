import type { MetaViewItemBatchSummary } from './runMetaViewItemOutboxBatch'

const IMMEDIATE_BATCH_SIZE = 1

type RunBatch = (input: {
  maxItems: number
}) => Promise<MetaViewItemBatchSummary>

export type CanonicalViewItemRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch: RunBatch
  scheduleAfter: (task: () => Promise<void>) => void
}

function shouldScheduleImmediateDispatch(status: number) {
  return status === 200 || status === 202
}

export async function handleCanonicalViewItemRoute(
  request: Request,
  dependencies: CanonicalViewItemRouteDependencies
) {
  const response = await dependencies.collect(request)

  if (shouldScheduleImmediateDispatch(response.status)) {
    dependencies.scheduleAfter(async () => {
      console.info('[meta-view-item-after] started')

      try {
        const summary = await dependencies.runBatch({
          maxItems: IMMEDIATE_BATCH_SIZE
        })
        console.info('[meta-view-item-after] completed', summary)
      } catch (error) {
        console.error('[meta-view-item-after] failed', error)
        throw error
      }
    })
  }

  return response
}
