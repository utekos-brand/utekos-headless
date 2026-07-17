import type { CanonicalSortApply } from '../sortApplyEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalSortApplyToGoogleDataManager } from './mapCanonicalSortApplyToGoogleDataManager'

export const dispatchCanonicalSortApplyToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalSortApply,
    'sort_apply'
  >({
    eventName: 'sort_apply',
    mapEvent: mapCanonicalSortApplyToGoogleDataManager
  })
