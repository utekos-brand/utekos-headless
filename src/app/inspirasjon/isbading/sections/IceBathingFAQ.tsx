import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { H2 } from '@/components/typography/TypographyH2'

export const iceBathingFaqItems = [
  {
    question: 'Hvordan er størrelsene?',
    answer:
      'Comfyrobe er designet med en oversized fit, slik at du enkelt kan trekke armene inn og skifte under den.'
  },
  {
    question: 'Blir den tung når den blir våt?',
    answer:
      'Ytterstoffet er vannavvisende, og innerfôret er laget av syntetisk lammeull som ikke trekker til seg vann på samme måte som bomull. Vekten vil øke, men varmen vil beholdes selv om du tar den rett på våt hud.'
  },
  {
    question: 'Kan den vaskes i maskin?',
    answer:
      'Ja, Comfyrobe kan vaskes i vaskemaskin. Vi anbefaler et skånsomt program med mildt vaskemiddel og 40°C. Vær bevisst på hvilket vaskemiddel du bruker.'
  },
  {
    question: 'Er den vindtett?',
    answer:
      'Ytterstoffet av HydroGuard™ har en vannsøyle på 80000 mm og pustende membran (~3000 g/m²/24 t) og tapede sømmer.'
  }
] as const

export function IceBathingFAQ() {
  return (
    <article className='overflow-x-clip border-t border-border bg-card py-16 text-card-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell className='max-w-3xl'>
        <H2
          ID='isbading-faq'
          Text='Ofte stilte spørsmål'
          className='mb-10 text-center text-card-foreground sm:mb-12'
        />

        <Accordion className='w-full'>
          {iceBathingFaqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index + 1}`}
              className='border-border'
            >
              <AccordionTrigger className='text-left leading-[1.35] tracking-normal text-card-foreground'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='leading-normal tracking-normal text-card-foreground/80'>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </InspirationContentShell>
    </article>
  )
}
