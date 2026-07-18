const IMMEDIATE_BATCH_SIZE = 1

export type CanonicalPageViewRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch: (input: { maxItems: number }) => Promise<unknown>
  scheduleAfter: (task: () => Promise<void>) => void
}

function shouldScheduleImmediateDispatch(status: number) {
  return status === 200 || status === 202
}

export async function handleCanonicalPageViewRoute(
  request: Request,
  dependencies: CanonicalPageViewRouteDependencies
) {
  const response = await dependencies.collect(request)

  if (shouldScheduleImmediateDispatch(response.status)) {
    dependencies.scheduleAfter(async () => {
      console.info('[page-view-outbox-after] started')

      try {
        const summary = await dependencies.runBatch({
          maxItems: IMMEDIATE_BATCH_SIZE
        })
        console.info(
          '[page-view-outbox-after] completed',
          summary
        )
      } catch (error) {
        console.error('[page-view-outbox-after] failed', error)
        throw error
      }
    })
  }

  return response
}
