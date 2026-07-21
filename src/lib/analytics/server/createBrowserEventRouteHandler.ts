export type BrowserEventRouteHandlerDependencies = {
  collect: (request: Request) => Promise<Response>
}

export function createBrowserEventRouteHandler() {
  return async function handleRoute(
    request: Request,
    dependencies: BrowserEventRouteHandlerDependencies
  ) {
    return dependencies.collect(request)
  }
}
