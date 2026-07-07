import { compareModelsTheme } from '../utils/compareModelsTheme'
import { CompareModelsSectionHeader } from './CompareModelsSectionHeader'
import { ComparisonTable } from './ComparisonTable'

export function ComparisonSection() {
  return (
    <article
      id='sammenligning'
      className={`overflow-hidden ${compareModelsTheme.darkSection} py-20 sm:py-28`}
    >
      <div className='mx-auto max-w-7xl px-[6vw]'>
        <CompareModelsSectionHeader
          badgeLabel='Detaljert sammenligning'
          headingId='sammenlign-egenskapene'
          heading='Sammenlign egenskapene'
          lead='Tabellen er laget for å gi deg en detaljert sammenligning av de tre Utekos-modellene. Les vannrett for én modell, eller loddrett for å se hvilken egenskap som betyr mest for deg.'
          surface='dark'
        />
        <div className='mt-12'>
          <ComparisonTable />
        </div>
      </div>
    </article>
  )
}
