import { canonicalVideoProgressSchema } from '../../videoProgressEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalVideoProgressToGoogleDataManager } from '../dispatchCanonicalVideoProgressToGoogleDataManager'

export const googleDataManagerVideoProgressProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalVideoProgressToGoogleDataManager,
    eventName: 'video_progress',
    key: 'google:video_progress',
    schema: canonicalVideoProgressSchema
  })
