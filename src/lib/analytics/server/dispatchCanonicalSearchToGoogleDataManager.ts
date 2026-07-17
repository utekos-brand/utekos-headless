import type { CanonicalSearch } from '../searchEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalSearchToGoogleDataManager } from './mapCanonicalSearchToGoogleDataManager'

export const dispatchCanonicalSearchToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalSearch,
    'search'
  >({
    eventName: 'search',
    mapEvent: mapCanonicalSearchToGoogleDataManager
  })
