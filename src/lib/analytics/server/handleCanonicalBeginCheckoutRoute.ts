const IMMEDIATE_BATCH_SIZE = 1

type RunBatch = (input: { maxItems: number }) => Promise<unknown>

export type CanonicalBeginCheckoutRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch: RunBatch
  scheduleAfter: (task: () => Promise<void>) => void
}

function shouldScheduleImmediateDispatch(status: number) {
  return status === 200 || status === 202
}

export async function handleCanonicalBeginCheckoutRoute(
  request: Request,
  dependencies: CanonicalBeginCheckoutRouteDependencies
) {
  const response = await dependencies.collect(request)

  if (shouldScheduleImmediateDispatch(response.status)) {
    dependencies.scheduleAfter(async () => {
      console.info('[begin-checkout-outbox-after] started')

      try {
        const summary = await dependencies.runBatch({
          maxItems: IMMEDIATE_BATCH_SIZE
        })
        console.info('[begin-checkout-outbox-after] completed', summary)
      } catch (error) {
        console.error('[begin-checkout-outbox-after] failed', error)
        throw error
      }
    })
  }

  return response
}
