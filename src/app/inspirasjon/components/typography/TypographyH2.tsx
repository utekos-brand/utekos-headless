import { H2 } from '@/components/typography/TypographyH2'
import { P } from '@/components/typography/TypographyP'

export function TypographyH2() {
  return (
    <>
      <H2
        ID='hero-subheading'
        className='font-utekos-text! pt-2 pb-0 text-xl font-normal md:text-3xl!'
      >
        Kompromissløs komfort og overlegen allsidighet.
      </H2>
      <P className='pt-2 text-center text-xl font-normal text-foreground/90 not-first:mt-0 md:text-3xl!'>
        Juster, form og nyt.
      </P>
    </>
  )
}
