import type { CanonicalScrollDepth } from '../scrollDepthEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalScrollDepthToGoogleDataManager } from './mapCanonicalScrollDepthToGoogleDataManager'

export const dispatchCanonicalScrollDepthToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalScrollDepth,
    'scroll_depth'
  >({
    eventName: 'scroll_depth',
    mapEvent: mapCanonicalScrollDepthToGoogleDataManager
  })
