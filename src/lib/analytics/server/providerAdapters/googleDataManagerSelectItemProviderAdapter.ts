import { canonicalSelectItemSchema } from '../../selectItemEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalSelectItemToGoogleDataManager } from '../dispatchCanonicalSelectItemToGoogleDataManager'

export const googleDataManagerSelectItemProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalSelectItemToGoogleDataManager,
    eventName: 'select_item',
    key: 'google:select_item',
    schema: canonicalSelectItemSchema
  })
