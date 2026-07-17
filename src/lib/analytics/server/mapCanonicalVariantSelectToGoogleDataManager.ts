import type { CanonicalVariantSelect } from '../variantSelectEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalVariantSelectToGoogleDataManager(
  event: CanonicalVariantSelect
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'variant_select')
}
