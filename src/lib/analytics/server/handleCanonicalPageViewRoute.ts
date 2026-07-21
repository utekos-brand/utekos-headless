export type CanonicalPageViewRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch?: (input: { maxItems: number }) => Promise<unknown>
  scheduleAfter?: (task: () => Promise<void>) => void
}

export async function handleCanonicalPageViewRoute(
  request: Request,
  dependencies: CanonicalPageViewRouteDependencies
) {
  return dependencies.collect(request)
}
