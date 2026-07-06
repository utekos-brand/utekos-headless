import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { PatternCard } from '@/components/ui/pattern-card'
import { techDownSizeCards } from '../utils/techDownSizeCards'
import { SizeGuideSectionShell } from './SizeGuideSectionShell'

export function TechDownSizeGuide() {
  return (
    <SizeGuideSectionShell
      id='tech-down-size-guide'
      surface='card'
    >
      <div className='max-w-5xl'>
        <BrandBadge
          label='TechDown™'
          bgColor='var(--background)'
          fgColor='var(--foreground)'
          className='mb-5 min-w-24 border border-border px-4 py-2 text-left text-lg md:px-6 md:py-3'
        />
        <h2 className='pt-4 pb-6 text-3xl leading-[1.05] font-bold text-inherit md:text-5xl lg:text-6xl'>
          Presisjon i hver størrelse
        </h2>
        <div className='font-utekos-text /90 space-y-4 text-lg leading-relaxed text-inherit/90'>
          <p>
            For livsnyteren som verdsetter både funksjon og form,
            er Utekos TechDown™ designet med en mer kroppsnær
            passform.
          </p>
          <p>
            Dette gir deg suveren bevegelsesfrihet og effektiv
            varme, pakket inn i et nettere design.
          </p>
          <p>
            Perfekt for et aktivt liv på hytten, i bobilen eller
            på kjølige kvelder på terrassen.
          </p>
          <p>
            Utekos TechDown™ sine størrelser har en tradisjonell
            progresjon for å sikre at du finner en størrelse som
            passer perfekt til din kroppstype.
          </p>
          <p>
            Valget ditt bør baseres på hvordan du har tenkt til å
            bruke den og hvilken passform du foretrekker for
            tekniske plagg.
          </p>
        </div>
      </div>

      <div className='mt-16 grid w-full grid-cols-1 place-content-start gap-4 lg:grid-cols-3'>
        {techDownSizeCards.map(card => (
          <PatternCard
            key={card.title}
            title={card.title}
            items={card.items}
            classes={{
              outer: 'bg-secondary',
              inner:
                'bg-background text-foreground text-left ring-foreground/12 shadow-[0_18px_46px_-38px_color-mix(in_oklab,var(--background)_90%,transparent)]',
              list: 'text-foreground',
              separator: 'border-border',
              footerLabel: 'text-foreground/90 /90',
              iconCircle: 'fill-background/35',
              iconRing: 'stroke-foreground/25',
              iconPath: 'stroke-foreground'
            }}
            footer={
              <a
                href='#tech-down-measurements'
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
