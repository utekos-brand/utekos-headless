export type CanonicalViewItemRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch: (input: { maxItems: number }) => Promise<unknown>
  scheduleAfter: (task: () => Promise<void>) => void
}

export async function handleCanonicalViewItemRoute(
  request: Request,
  dependencies: CanonicalViewItemRouteDependencies
) {
  return dependencies.collect(request)
}
