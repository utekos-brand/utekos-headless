// Path: src/lib/tracking/meta/extractMetaCatalogCustomLabels.ts
import { normalizeCustomLabelValue } from './utils/normalizeCustomLabelValue'
import type {
  MetaCatalogCustomLabelKey,
  MetaCatalogCustomLabels,
  MetaCatalogVariant
} from './metaCatalogTypes'
import { CUSTOM_LABEL_MAPPINGS } from './constants'

export function extractMetaCatalogCustomLabels(
  variant: Pick<
    MetaCatalogVariant,
    'customLabel0' | 'customLabel1' | 'customLabel2' | 'customLabel3' | 'customLabel4'
  >
) {
  const labels: MetaCatalogCustomLabels = {}
  const missingLabels: MetaCatalogCustomLabelKey[] = []

  for (const mapping of CUSTOM_LABEL_MAPPINGS) {
    const normalizedValue = normalizeCustomLabelValue(variant[mapping.variantField]?.value)

    if (normalizedValue) {
      labels[mapping.labelKey] = normalizedValue
      continue
    }

    missingLabels.push(mapping.labelKey)
  }

  return { labels, missingLabels }
}
