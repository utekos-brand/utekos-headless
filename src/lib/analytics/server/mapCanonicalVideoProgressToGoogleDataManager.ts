import type { CanonicalVideoProgress } from '../videoProgressEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalVideoProgressToGoogleDataManager(
  event: CanonicalVideoProgress
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'video_progress')
}
