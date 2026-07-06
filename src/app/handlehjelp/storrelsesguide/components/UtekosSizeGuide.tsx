import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { PatternCard } from '@/components/ui/pattern-card'
import { utekosSizeCards } from '../utils/utekosSizeCards'
import { SizeGuideSectionShell } from './SizeGuideSectionShell'

export function UtekosSizeGuide() {
  return (
    <SizeGuideSectionShell
      id='utekos-size-guide'
      surface='background'
      ariaLabelledby='utekos-size-guide-heading'
    >
      <div className='max-w-5xl'>
        <BrandBadge
          label='Mikrofiber™'
          bgColor='var(--card)'
          fgColor='var(--card-foreground)'
          className='mb-5 min-w-24 place-content-start border border-border px-4 py-2 text-left text-lg md:px-6 md:py-3'
        />
        <h2
          id='utekos-size-guide-heading'
          className='pt-4 pb-6 text-3xl leading-[1.05] font-bold text-foreground md:text-5xl lg:text-6xl'
        >
          En unik tilnærming til passform
        </h2>

        <p className='font-utekos-text /90 max-w-3xl text-2xl leading-tight text-foreground/90'>
          Mer enn bare en størrelse. <br />
          En garanti for komfort gjennom suveren tilpasningsevne.
        </p>
      </div>

      <div className='brand-tracking-normal font-utekos-text /90 mt-12 max-w-5xl space-y-6 text-left text-lg leading-relaxed text-foreground/90'>
        <p>
          Vi har designet Utekos Dun og Mikrofiber med en unik
          filosofi: ultimat komfort gjennom suveren
          tilpasningsevne. Du vil legge merke til at spranget fra
          Medium til Large er betydelig – dette er helt bevisst.
          Målet er ikke at du skal finne en størrelse som{' '}
          <em>nesten</em> passer, men en som du kan forme
          nøyaktig slik du vil ha den, uansett anledning.
        </p>
        <p>
          Hemmeligheten ligger i de smarte justeringsmulighetene
          som lar deg skreddersy passformen etter vær, antrekk og
          humør.
        </p>
      </div>

      <div className='mt-16 grid w-full grid-cols-1 place-content-start gap-4 lg:grid-cols-2'>
        {utekosSizeCards.map(card => (
          <PatternCard
            key={card.title}
            title={card.title}
            items={card.items}
            classes={{
              outer: 'bg-card',
              inner:
                'bg-background text-foreground text-left ring-foreground/12 shadow-[0_18px_46px_-38px_color-mix(in_oklab,var(--background)_90%,transparent)]',
              list: 'text-foreground',
              separator: 'border-border',
              footerLabel: 'text-foreground/90 /90',
              iconCircle: 'fill-card/35',
              iconRing: 'stroke-foreground/25',
              iconPath: 'stroke-foreground'
            }}
            footer={
              <a
                href='#utekos-measurements'
                className='text-foreground underline decoration-primary underline-offset-3 hover:decoration-2'
              >
                Se måletabellen &darr;
              </a>
            }
          />
        ))}
      </div>
    </SizeGuideSectionShell>
  )
}
