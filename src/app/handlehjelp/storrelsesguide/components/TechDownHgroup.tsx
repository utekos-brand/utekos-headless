import { techDownFeatures } from '../utils/techDownFeatures'
import { SizeGuideSectionShell } from './SizeGuideSectionShell'

export function TechDownHgroup() {
  return (
    <SizeGuideSectionShell
      id='tech-down-details'
      surface='teal'
      ariaLabelledby='tech-down-details-heading'
    >
      <h2
        id='tech-down-details-heading'
        className='dark:text-dark-sidebar-foreground mb-4 max-w-4xl font-sans text-4xl leading-[1.05] font-bold text-sidebar-foreground md:text-5xl lg:text-6xl'
      >
        Gjennomtenkte detaljer
      </h2>

      <div className='mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {techDownFeatures.map(feature => (
          <div
            key={feature.title}
            className='dark:border-dark-foreground/12 dark:bg-dark-background h-full rounded-lg border border-foreground/12 bg-background p-6 text-left shadow-[0_18px_46px_-38px_color-mix(in_oklab,var(--background)_90%,transparent)]'
          >
            <div className='flex items-center gap-4'>
              <div className=' flex size-12 shrink-0 items-center justify-center rounded-full bg-card text-foreground'>
                <feature.Icon
                  className='size-6'
                  aria-hidden='true'
                />
              </div>
              <h3 className='font-utekos-text-medium text-lg text-foreground'>
                {feature.title}
              </h3>
            </div>
            <p className='/90 mt-2 text-base leading-relaxed text-foreground/90'>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </SizeGuideSectionShell>
  )
}
