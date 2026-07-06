import type { OptimisticCartLines } from 'types/cart'

export const removeZeroQuantityLines = (
  lines: OptimisticCartLines['lines']
): OptimisticCartLines['lines'] => {
  return Object.fromEntries(
    Object.entries(lines).filter(([, quantity]) => quantity > 0)
  )
}
