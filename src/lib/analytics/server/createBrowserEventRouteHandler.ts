type RunBatch = (input: { maxItems: number }) => Promise<unknown>

export type BrowserEventRouteHandlerDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch?: RunBatch
  scheduleAfter?: (task: () => Promise<void>) => void
}

export function createBrowserEventRouteHandler(_logLabel?: string) {
  return async function handleRoute(
    request: Request,
    dependencies: BrowserEventRouteHandlerDependencies
  ) {
    return dependencies.collect(request)
  }
}
