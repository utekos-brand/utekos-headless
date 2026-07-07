import { modelRecommendations } from '../utils/comparisonData'
import { compareModelsTheme } from '../utils/compareModelsTheme'
import { CompareModelsSectionHeader } from './CompareModelsSectionHeader'
import { PersonaRecommendationCard } from './PersonaRecommendationCard'

export function PersonaCards() {
  return (
    <article
      id='velg-etter-bruk'
      className={`${compareModelsTheme.lightSection} py-20 sm:py-28`}
    >
      <div className='mx-auto max-w-7xl px-[6vw]'>
        <CompareModelsSectionHeader
          badgeLabel='Velg etter bruk'
          headingId='hva-er-riktig-utekos-for-deg'
          heading='Hva er riktig Utekos for deg?'
          lead='Å velge riktig Utekos handler i stor grad om å finne balansen mellom varme, vekt, pakkvolum og hva du faktisk skal bruke jakken til.'
        />

        <div className='mt-14 grid gap-8 lg:grid-cols-3'>
          {modelRecommendations.map(model => (
            <PersonaRecommendationCard key={model.key} model={model} />
          ))}
        </div>
      </div>
    </article>
  )
}
