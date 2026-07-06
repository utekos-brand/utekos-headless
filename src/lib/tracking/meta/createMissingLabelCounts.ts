import { META_CUSTOM_LABEL_KEYS, type MetaCatalogCustomLabelKey } from './metaCatalogTypes'

export function createMissingLabelCounts(): Record<MetaCatalogCustomLabelKey, number> {
  return META_CUSTOM_LABEL_KEYS.reduce(
    (counts, key) => {
      counts[key] = 0
      return counts
    },
    {} as Record<MetaCatalogCustomLabelKey, number>
  )
}
