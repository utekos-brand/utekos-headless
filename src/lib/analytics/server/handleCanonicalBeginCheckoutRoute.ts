export type CanonicalBeginCheckoutRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch: (input: { maxItems: number }) => Promise<unknown>
  scheduleAfter: (task: () => Promise<void>) => void
}

export async function handleCanonicalBeginCheckoutRoute(
  request: Request,
  dependencies: CanonicalBeginCheckoutRouteDependencies
) {
  return dependencies.collect(request)
}
