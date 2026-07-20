type RunBatch = (input: { maxItems: number }) => Promise<unknown>

export function createBrowserEventRouteHandler(_logLabel: string) {
  return async function handleRoute(
    request: Request,
    dependencies: {
      collect: (request: Request) => Promise<Response>
      runBatch: RunBatch
      scheduleAfter: (task: () => Promise<void>) => void
    }
  ) {
    return dependencies.collect(request)
  }
}
