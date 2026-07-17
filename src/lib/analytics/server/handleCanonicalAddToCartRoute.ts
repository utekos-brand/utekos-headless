const IMMEDIATE_BATCH_SIZE = 1

type RunBatch = (input: { maxItems: number }) => Promise<unknown>

export type CanonicalAddToCartRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch: RunBatch
  scheduleAfter: (task: () => Promise<void>) => void
}

function shouldScheduleImmediateDispatch(status: number) {
  return status === 200 || status === 202
}

export async function handleCanonicalAddToCartRoute(
  request: Request,
  dependencies: CanonicalAddToCartRouteDependencies
) {
  const response = await dependencies.collect(request)

  if (shouldScheduleImmediateDispatch(response.status)) {
    dependencies.scheduleAfter(async () => {
      console.info('[add-to-cart-outbox-after] started')

      try {
        const summary = await dependencies.runBatch({
          maxItems: IMMEDIATE_BATCH_SIZE
        })
        console.info('[add-to-cart-outbox-after] completed', summary)
      } catch (error) {
        console.error('[add-to-cart-outbox-after] failed', error)
        throw error
      }
    })
  }

  return response
}
