'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { PRODUCT_CARE_FAQS } from '../constants'
import { SizeGuideSectionShell } from '@/app/handlehjelp/storrelsesguide/components/SizeGuideSectionShell'
export function ProductCareFaq() {
  return (
    <SizeGuideSectionShell
      id='faq-section'
      surface='background'
      ariaLabelledby='faq-heading'
      className='dark:border-dark-foreground/70 border-t border-foreground/70'
    >
      <article
        aria-labelledby='faq-heading'
        className='mx-auto w-full text-left lg:max-w-7xl'
      >
        <div className='mb-8 text-left'>
          <h2
            id='faq-heading'
            className='text-left font-sans text-5xl leading-[0.95] font-bold text-foreground sm:text-5xl'
          >
            Vanlige spørsmål
          </h2>
          <p className='font-utekos-text-medium /90 mt-5 text-left text-lg leading-8 text-foreground/90'>
            Svar på det kundene våre oftest lurer på om vask og
            vedlikehold.
          </p>
        </div>

        <Accordion
          multiple={false}
          className='dark:border-dark-card/30 dark:bg-dark-background rounded-lg border-t border-card/30 bg-background'
        >
          {PRODUCT_CARE_FAQS.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index + 1}`}
              className=' dark:border-dark-card/30 dark:bg-dark-background rounded-xl border-t border-border border-card/30 bg-background p-4'
            >
              <AccordionTrigger className='dark:**:data-[slot=accordion-trigger-icon]:text-dark-primary py-4 text-left font-sans text-base font-semibold text-foreground hover:no-underline **:data-[slot=accordion-trigger-icon]:text-primary sm:py-5 sm:text-lg'>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className='font-utekos-text-medium /90 pb-4 text-left text-base leading-relaxed text-foreground/90 sm:pb-5'>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </article>
    </SizeGuideSectionShell>
  )
}
