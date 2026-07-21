export type CanonicalAddToCartRouteDependencies = {
  collect: (request: Request) => Promise<Response>
  runBatch: (input: { maxItems: number }) => Promise<unknown>
  scheduleAfter: (task: () => Promise<void>) => void
}

export async function handleCanonicalAddToCartRoute(
  request: Request,
  dependencies: CanonicalAddToCartRouteDependencies
) {
  return dependencies.collect(request)
}
