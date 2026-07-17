import type { CanonicalScrollDepth } from '../scrollDepthEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalScrollDepthToGoogleDataManager(
  event: CanonicalScrollDepth
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'scroll_depth')
}
