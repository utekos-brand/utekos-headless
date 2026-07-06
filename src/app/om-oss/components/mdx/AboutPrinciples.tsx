import { Award, Coffee, Handshake, Leaf } from 'lucide-react'
import { AboutBadge } from './AboutBadge'
import { PatternFrame } from '@/components/ui/pattern-frame' // Tilpass import-stien til prosjektet ditt

const principles = [
  {
    icon: Coffee,
    title: 'Designet for hygge',
    text: 'Vi vet at en sommerkveld kan bli kjølig og en høstdag krever ekstra varme. Derfor er produktene våre designet med en dyp forståelse for den norske livsstilen og behovet for å forlenge de sosiale, gode øyeblikkene utendørs.'
  },
  {
    icon: Award,
    title: 'Kompromissløs komfort',
    text: 'Kvalitet er en følelse. Vi velger materialer som er myke, funksjonelle og behagelige, slik at du kan slappe helt av og nyte stunden.'
  },
  {
    icon: Leaf,
    title: 'Et bevisst valg',
    text: 'I en verden av rask mote, fokuserer vi på tidløs design og solid håndverk som tåler å bli brukt igjen og igjen. Et Utekos-plagg er et bevisst valg for deg, og et mer ansvarlig valg for naturen vi alle setter pris på.'
  },
  {
    icon: Handshake,
    title: 'Mer utekos',
    text: 'Utekos handler for oss om å verdsette de rolige øyeblikkene: en kaffekopp på en kjølig morgen, en god samtale rundt bålpannen, eller en solnedgang fra terrassen.'
  }
]

export function AboutPrinciples() {
  return (
    <PatternFrame
      as='article'
      surface='transparent'
      variant='content'
      contentWidth='min(100%, 80rem)' // Tilsvarer max-w-7xl for riktig plassering av pattern-gutters
      className='dark:bg-dark-secondary dark:text-dark-secondary-foreground w-full bg-secondary py-20 text-secondary-foreground sm:py-28'
      contentClassName='flex w-full flex-col px-4 sm:px-6 lg:px-8'
    >
      <div className='mb-12 flex max-w-3xl flex-col items-start pt-6 pb-6 md:pt-8 lg:mb-16 lg:pt-10'>
        <AboutBadge
          variant='primary'
          className='dark:border-dark-card/30 mb-6 border border-card/30'
        >
          Vårt DNA
        </AboutBadge>
        <h2 className='dark:text-dark-secondary-foreground text-left font-sans text-4xl leading-tight font-bold text-secondary-foreground sm:text-5xl'>
          Kjernen i alt vi gjør
        </h2>
        <p className='font-utekos-text-medium dark:text-dark-secondary-foreground mt-6 max-w-prose text-left text-lg leading-relaxed text-secondary-foreground'>
          Fire ufravikelige prinsipper som sikrer at du alltid
          får den opplevelsen du fortjener.
        </p>
      </div>

      {/* Grid med Pattern Card Layout */}
      <div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8'>
        {principles.map(item => (
          <article
            key={item.title}
            // Det ytre skallet: Skarpt design inspirert av testboks-patternet
            className='dark:bg-dark-foreground/5 flex min-w-0 shrink-0 flex-col bg-foreground/5 p-2'
          >
            {/* Det indre kortet: Holder fargepaletten og avrundede hjørner for komfort-følelsen */}
            <div className='dark:border-dark-foreground  flex h-full flex-col rounded-xl border border-foreground bg-card p-6 text-card-foreground shadow-sm sm:p-8 md:p-10'>
              {/* Header for kort: Bygget mobile-first */}
              <div className='mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5'>
                <div className='dark:bg-dark-secondary dark:text-dark-secondary-foreground flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground'>
                  <item.icon
                    aria-hidden='true'
                    className='size-6'
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className='text-left font-sans text-xl leading-tight font-semibold text-card-foreground sm:text-2xl'>
                  {item.title}
                </h3>
              </div>

              {/* Tekst innhold */}
              <p className='font-utekos-text mt-auto max-w-prose text-left text-base leading-relaxed text-card-foreground'>
                {item.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </PatternFrame>
  )
}
