import type { CanonicalHeroInteract } from '../heroInteractEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalHeroInteractToGoogleDataManager(
  event: CanonicalHeroInteract
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'hero_interact')
}
