import type {
  ShopifyCartSnapshot,
  ShopifyCartSnapshotLine
} from './shopifyCartSnapshotStore'

export type ShopifyCartQuantityDelta =
  | {
      kind: 'removed'
      quantity_removed: number
      prior_line: ShopifyCartSnapshotLine
      current_quantity: number
    }
  | {
      kind: 'increased'
      quantity_added: number
      variant_id: string
    }
  | {
      kind: 'unchanged'
      variant_id: string
      quantity: number
    }

function aggregateByVariant(
  lines: readonly ShopifyCartSnapshotLine[]
) {
  const byVariant = new Map<string, ShopifyCartSnapshotLine>()

  for (const line of lines) {
    const existing = byVariant.get(line.variant_id)
    if (!existing) {
      byVariant.set(line.variant_id, { ...line })
      continue
    }

    byVariant.set(line.variant_id, {
      ...existing,
      quantity: existing.quantity + line.quantity
    })
  }

  return byVariant
}

/**
 * Diff two cart snapshots by aggregated variant_id quantity.
 * Removals are quantity decreases or lines absent from current.
 * Increases and noops are recorded for tests/evidence only.
 */
export function diffShopifyCartSnapshots(input: {
  prior: ShopifyCartSnapshot
  current: ShopifyCartSnapshot
}): ShopifyCartQuantityDelta[] {
  const priorByVariant = aggregateByVariant(input.prior.line_items)
  const currentByVariant = aggregateByVariant(
    input.current.line_items
  )
  const deltas: ShopifyCartQuantityDelta[] = []
  const seen = new Set<string>()

  for (const [variantId, priorLine] of priorByVariant) {
    seen.add(variantId)
    const currentLine = currentByVariant.get(variantId)
    const currentQuantity = currentLine?.quantity ?? 0

    if (currentQuantity < priorLine.quantity) {
      deltas.push({
        kind: 'removed',
        quantity_removed: priorLine.quantity - currentQuantity,
        prior_line: priorLine,
        current_quantity: currentQuantity
      })
      continue
    }

    if (currentQuantity > priorLine.quantity) {
      deltas.push({
        kind: 'increased',
        quantity_added: currentQuantity - priorLine.quantity,
        variant_id: variantId
      })
      continue
    }

    deltas.push({
      kind: 'unchanged',
      variant_id: variantId,
      quantity: priorLine.quantity
    })
  }

  for (const [variantId, currentLine] of currentByVariant) {
    if (seen.has(variantId)) continue

    deltas.push({
      kind: 'increased',
      quantity_added: currentLine.quantity,
      variant_id: variantId
    })
  }

  return deltas
}

export function removalsFromCartDiff(
  deltas: readonly ShopifyCartQuantityDelta[]
) {
  return deltas.filter(
    (
      delta
    ): delta is Extract<
      ShopifyCartQuantityDelta,
      { kind: 'removed' }
    > => delta.kind === 'removed'
  )
}
