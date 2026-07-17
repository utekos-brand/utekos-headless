import type { CanonicalVideoProgress } from '../videoProgressEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalVideoProgressToGoogleDataManager } from './mapCanonicalVideoProgressToGoogleDataManager'

export const dispatchCanonicalVideoProgressToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalVideoProgress,
    'video_progress'
  >({
    eventName: 'video_progress',
    mapEvent: mapCanonicalVideoProgressToGoogleDataManager
  })
