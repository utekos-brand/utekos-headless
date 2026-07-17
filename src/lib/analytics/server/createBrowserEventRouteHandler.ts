const IMMEDIATE_BATCH_SIZE = 1

type RunBatch = (input: { maxItems: number }) => Promise<unknown>

export function createBrowserEventRouteHandler(logLabel: string) {
  return async function handleRoute(
    request: Request,
    dependencies: {
      collect: (request: Request) => Promise<Response>
      runBatch: RunBatch
      scheduleAfter: (task: () => Promise<void>) => void
    }
  ) {
    const response = await dependencies.collect(request)

    if (response.status === 200 || response.status === 202) {
      dependencies.scheduleAfter(async () => {
        console.info(`[${logLabel}-outbox-after] started`)

        try {
          const summary = await dependencies.runBatch({
            maxItems: IMMEDIATE_BATCH_SIZE
          })
          console.info(`[${logLabel}-outbox-after] completed`, summary)
        } catch (error) {
          console.error(`[${logLabel}-outbox-after] failed`, error)
          throw error
        }
      })
    }

    return response
  }
}
