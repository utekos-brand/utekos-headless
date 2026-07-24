import type { CanonicalHeroInteract } from '../heroInteractEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalHeroInteractToGoogleDataManager } from './mapCanonicalHeroInteractToGoogleDataManager'

export const dispatchCanonicalHeroInteractToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalHeroInteract,
    'hero_interact'
  >({
    eventName: 'hero_interact',
    mapEvent: mapCanonicalHeroInteractToGoogleDataManager
  })
