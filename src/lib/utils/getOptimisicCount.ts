// Path: src/lib/utils/getOptimisticCount.ts

export const getOptimisticCount = (
  lines: Record<string, unknown> | undefined
): number => {
  if (!lines) return 0
  return Object.values(lines).reduce<number>((sum, line) => {
    const quantity = (line as { quantity?: unknown })?.quantity
    return sum + (typeof quantity === 'number' ? quantity : 0)
  }, 0)
}
