import { InspirationSeasonsSection } from '../components/InspirationSeasonsSection'
import { boatingSeasons } from './boatingSeasons'

export function BoatSeasonSection() {
  return (
    <InspirationSeasonsSection
      title='Tips for en lengre sesong'
      lead='Nyt båtlivet fra tidlig vår til sen høst'
      seasons={boatingSeasons}
      defaultValue='summer'
      glowTokens={['var(--ancient-water)', 'var(--primary)']}
      tabTriggerClassName='border-cloud-dancer/18 bg-havdyp text-cloud-dancer hover:bg-havdyp/90 data-active:border-cloud-dancer data-active:bg-havdyp data-active:text-cloud-dancer'
      tabActiveClassName='text-cloud-dancer'
      tabInactiveClassName='text-cloud-dancer'
      contentCardClassName='border-cloud-dancer/18 bg-havdyp'
      contentIconClassName='border-cloud-dancer/18 bg-cloud-dancer text-black-beauty'
      contentIconGlyphClassName='text-black-beauty'
      contentTitleClassName='text-cloud-dancer'
      contentTextClassName='text-cloud-dancer'
    />
  )
}
