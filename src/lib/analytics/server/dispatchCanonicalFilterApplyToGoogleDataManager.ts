import type { CanonicalFilterApply } from '../filterApplyEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalFilterApplyToGoogleDataManager } from './mapCanonicalFilterApplyToGoogleDataManager'

export const dispatchCanonicalFilterApplyToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalFilterApply,
    'filter_apply'
  >({
    eventName: 'filter_apply',
    mapEvent: mapCanonicalFilterApplyToGoogleDataManager
  })
