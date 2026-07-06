import { techDownData } from '../utils/data'
import { SizeGuideSectionShell } from './SizeGuideSectionShell'

export function TechDownMeasurement() {
  return (
    <SizeGuideSectionShell
      id='tech-down-measurements'
      surface='background'
      ariaLabelledby='tech-down-measurements-heading'
    >
      <h2
        id='tech-down-measurements-heading'
        className='max-w-4xl font-sans text-4xl leading-[1.05] font-bold text-foreground md:text-5xl lg:text-6xl'
      >
        Måletabell for TechDown™
      </h2>
      <p className='/90 mt-5 max-w-3xl text-lg leading-relaxed text-foreground/90'>
        Bruk målene som presis kontroll når du velger mellom
        Liten, Medium og Large.
      </p>

      <div className='mt-12 w-full'>
        <div
          className='dark:focus-visible:ring-dark-foreground/80 dark:focus-visible:ring-offset-dark-background w-full overflow-x-auto rounded-lg focus-visible:ring-2 focus-visible:ring-foreground/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none'
          role='region'
          aria-label='Måletabell for TechDown størrelser'
          tabIndex={0}
        >
          <div className='w-full max-lg:min-w-max'>
            <div className='dark:border-dark-foreground/12 overflow-hidden rounded-lg border border-foreground/12 shadow-[0_22px_54px_-42px_color-mix(in_oklab,var(--background)_90%,transparent)]'>
              <table className='dark:divide-dark-foreground/12  w-full divide-y divide-foreground/12 bg-card text-foreground max-lg:min-w-2xl'>
                <thead className='dark:bg-dark-sidebar dark:text-dark-sidebar-foreground bg-sidebar text-sidebar-foreground'>
                  <tr>
                    <th
                      scope='col'
                      className='py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-6'
                    >
                      Måling
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 text-center text-sm font-semibold'
                    >
                      Liten
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 text-center text-sm font-semibold'
                    >
                      Middels
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 text-center text-sm font-semibold'
                    >
                      Stor
                    </th>
                  </tr>
                </thead>
                <tbody className='dark:divide-dark-foreground/12 divide-y divide-foreground/12'>
                  {techDownData.map(item => (
                    <tr key={item.measurement}>
                      <td className='py-4 pr-3 pl-4 text-left text-sm font-medium whitespace-nowrap text-foreground sm:pl-6'>
                        {item.measurement}
                      </td>
                      <td className='px-3 py-4 text-center text-sm whitespace-nowrap text-foreground'>
                        {item.liten}
                      </td>
                      <td className='px-3 py-4 text-center text-sm whitespace-nowrap text-foreground'>
                        {item.middels}
                      </td>
                      <td className='px-3 py-4 text-center text-sm whitespace-nowrap text-foreground'>
                        {item.stor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SizeGuideSectionShell>
  )
}
