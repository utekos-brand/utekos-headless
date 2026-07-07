import { deepDiveSections } from '../utils/comparisonData'
import { compareModelsTheme } from '../utils/compareModelsTheme'
import { CompareModelsSectionHeader } from './CompareModelsSectionHeader'

export function DeepDiveSection() {
  return (
    <article
      aria-labelledby='sammenlign-modeller-deep-dive-heading'
      className={`${compareModelsTheme.lightSection} py-20 sm:py-28`}
    >
      <div className='mx-auto max-w-7xl px-[6vw]'>
        <CompareModelsSectionHeader
          badgeLabel='Slik velger du'
          badgeTone='neutral'
          headingId='sammenlign-modeller-deep-dive-heading'
          heading='Se etter vær, vekt og hvor plagget skal bo'
          lead='De fleste velger riktig når de starter med bruk, ikke materiale. Her er de viktigste valgene forklart kort.'
        />

        <ul className={`mt-14 ${compareModelsTheme.listDivider}`}>
          {deepDiveSections.map(section => (
            <li key={section.title}>
              <article className='mx-auto max-w-4xl py-10 lg:py-14'>
                <p
                  className={`text-sm font-medium ${compareModelsTheme.bodyMuted}`}
                >
                  {section.eyebrow}
                </p>
                <h3 className='mt-4 font-sans text-3xl leading-[0.98] font-bold text-foreground sm:text-4xl'>
                  {section.title}
                </h3>

                <ul
                  className={`leading-text-paragraph mt-7 list-disc space-y-4 pl-5 text-base font-medium text-foreground sm:text-lg ${compareModelsTheme.listMarker}`}
                >
                  <li>{section.body}</li>
                  {section.points.map(point => (
                    <li
                      key={point}
                      className={compareModelsTheme.bodyMuted}
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
