import type { CanonicalFormStart } from '../formStartEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalFormStartToGoogleDataManager } from './mapCanonicalFormStartToGoogleDataManager'

export const dispatchCanonicalFormStartToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalFormStart,
    'form_start'
  >({
    eventName: 'form_start',
    mapEvent: mapCanonicalFormStartToGoogleDataManager
  })
