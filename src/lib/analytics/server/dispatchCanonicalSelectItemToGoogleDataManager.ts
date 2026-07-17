import type { CanonicalSelectItem } from '../selectItemEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalSelectItemToGoogleDataManager } from './mapCanonicalSelectItemToGoogleDataManager'

export const dispatchCanonicalSelectItemToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalSelectItem,
    'select_item'
  >({
    eventName: 'select_item',
    mapEvent: mapCanonicalSelectItemToGoogleDataManager
  })
