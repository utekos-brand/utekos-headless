import Image from 'next/image'
import UtekosWordmark from '@public/WordmarkWhite.svg'
import { Lead } from '@/components/typography/Lead'
import { H1 } from '@/components/typography/TypographyH1'

export function ProductsPageHeader() {
  return (
    <article className='bg-background py-12 md:py-16'>
      <header className='relative w-full overflow-hidden rounded-3xl'>
        <div className='container relative z-10 mx-auto px-4 text-center'>
          <Image
            src={UtekosWordmark}
            alt='Utekos Wordmark'
            width={100}
            height={100}
            className='mx-auto mb-8 h-33 w-125'
          />

          <H1
            ID='products-page-header-title'
            Text='Kolleksjonen for kompromissløs komfort'
            className='mx-auto py-8 text-center! text-5xl!'
          >
            Kolleksjonen for kompromissløs komfort
          </H1>

          <Lead
            Text='Vi har redefinert utekosen gjennom teknologi og funksjonalitet. Utforsk vår kolleksjon og skreddersy din egen varme.'
            className='mx-auto mt-4 w-full max-w-3xl text-center'
          />
        </div>
      </header>
    </article>
  )
}
