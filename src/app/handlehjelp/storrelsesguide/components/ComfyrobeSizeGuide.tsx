import {
  Expand,
  Footprints,
  GitCommitVertical,
  PackageOpen
} from 'lucide-react'

import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { comfyrobeData } from '../utils/data'
import { SizeGuideSectionShell } from './SizeGuideSectionShell'

const comfyrobeFeatures = [
  {
    Icon: Expand,
    title: 'Romslig og beskyttende',
    description:
      'Den rektangulære unisex-passformen er bevisst romslig for å enkelt passe over alt fra våte klær til en tykk genser.'
  },
  {
    Icon: Footprints,
    title: 'Full bevegelsesfrihet',
    description:
      'Splitt i sidene og bak sikrer at du kan bevege deg fritt, enten du går tur, klatrer eller bare strekker deg etter kaffekoppen.'
  },
  {
    Icon: PackageOpen,
    title: 'Gjennomtenkt oppbevaring',
    description:
      'To varme, fôrede sidelommer holder hendene dine lune, mens en trygg innerlomme tar vare på verdisakene dine.'
  },
  {
    Icon: GitCommitVertical,
    title: 'Toveis YKK®-glidelås',
    description:
      'Gir deg full kontroll over ventilasjon og gjør av- og påkledning enkelt, selv når du har hendene fulle.'
  }
]

export function ComfyrobeSizeGuide() {
  return (
    <SizeGuideSectionShell
      id='comfyrobe-size-guide'
      surface='teal'
      ariaLabelledby='comfyrobe-size-guide-heading'
    >
      <div className='max-w-5xl'>
        <BrandBadge
          label='Comfyrobe™'
          bgColor='var(--sidebar-foreground)'
          fgColor='var(--sidebar)'
          className='dark:border-dark-sidebar-foreground/12 mb-5 min-w-24 border border-sidebar-foreground/12 px-4 py-2 text-left text-lg md:px-6 md:py-3'
        />
        <h2
          id='comfyrobe-size-guide-heading'
          className='dark:text-dark-sidebar-foreground text-3xl leading-[1.05] font-bold text-sidebar-foreground md:text-5xl lg:text-6xl'
        >
          Størrelsesguide for Comfyrobe™
        </h2>

        <p className='dark:text-dark-sidebar-foreground/90 mt-12 max-w-4xl text-lg leading-relaxed text-sidebar-foreground/90'>
          Comfyrobe™ er designet som ditt personlige, beskyttende
          skall. Den romslige, rektangulære passformen er ment å
          være omsluttende og komfortabel, ikke figurnær.
          Hensikten er at den enkelt skal kunne trekkes over alt
          du har på deg, samtidig som smarte detaljer sikrer deg
          full bevegelsesfrihet.
        </p>
      </div>

      <div className='mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {comfyrobeFeatures.map(feature => (
          <div
            key={feature.title}
            className='dark:border-dark-foreground/12 dark:bg-dark-background h-full rounded-lg border border-foreground/12 bg-background p-6 text-left shadow-[0_18px_46px_-38px_color-mix(in_oklab,var(--background)_90%,transparent)]'
          >
            <div className='flex items-center gap-4'>
              <div className=' flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground'>
                <feature.Icon
                  className='size-5'
                  aria-hidden='true'
                />
              </div>
              <h3 className='font-utekos-text-medium text-lg text-foreground'>
                {feature.title}
              </h3>
            </div>
            <p className='/90 mt-2 text-sm leading-relaxed text-foreground/90'>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className='mt-12 w-full'>
        <div
          className='dark:focus-visible:ring-dark-foreground/80 focus-visible:ring-offset-teal w-full overflow-x-auto rounded-lg focus-visible:ring-2 focus-visible:ring-foreground/80 focus-visible:ring-offset-2 focus-visible:outline-none'
          role='region'
          aria-label='Måletabell for Comfyrobe størrelser'
          tabIndex={0}
        >
          <div className='w-full max-lg:min-w-max'>
            <div className='dark:border-dark-foreground/12 overflow-hidden rounded-lg border border-foreground/12 shadow-[0_18px_44px_-36px_color-mix(in_oklab,var(--background)_72%,transparent)]'>
              <table className='dark:divide-dark-foreground/12 dark:bg-dark-background w-full divide-y divide-foreground/12 bg-background text-foreground max-lg:min-w-176'>
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
                      Small
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 text-center text-sm font-semibold'
                    >
                      Medium
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 text-center text-sm font-semibold'
                    >
                      Large
                    </th>
                  </tr>
                </thead>
                <tbody className='dark:divide-dark-foreground/12 divide-y divide-foreground/12'>
                  {comfyrobeData.map(row => (
                    <tr key={row.measurement}>
                      <td className='py-4 pr-3 pl-4 text-left text-sm font-medium whitespace-nowrap text-foreground sm:pl-6'>
                        {row.measurement}
                      </td>
                      <td className='px-3 py-4 text-center text-sm whitespace-nowrap text-foreground'>
                        {row.xs}
                      </td>
                      <td className='px-3 py-4 text-center text-sm whitespace-nowrap text-foreground'>
                        {row.ml}
                      </td>
                      <td className='px-3 py-4 text-center text-sm whitespace-nowrap text-foreground'>
                        {row.lxl}
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
