import { canonicalHeroInteractSchema } from '../../heroInteractEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalHeroInteractToGoogleDataManager } from '../dispatchCanonicalHeroInteractToGoogleDataManager'

export const googleDataManagerHeroInteractProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalHeroInteractToGoogleDataManager,
    eventName: 'hero_interact',
    key: 'google:hero_interact',
    schema: canonicalHeroInteractSchema
  })
