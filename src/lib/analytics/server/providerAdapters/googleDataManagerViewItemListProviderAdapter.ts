import { canonicalViewItemListSchema } from '../../viewItemListEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalViewItemListToGoogleDataManager } from '../dispatchCanonicalViewItemListToGoogleDataManager'

export const googleDataManagerViewItemListProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalViewItemListToGoogleDataManager,
    eventName: 'view_item_list',
    key: 'google:view_item_list',
    schema: canonicalViewItemListSchema
  })
