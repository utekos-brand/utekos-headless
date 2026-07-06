import Image from 'next/image'

const KLARNA_DESKTOP_PROMO_SRC =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Klarna_1024x768-Velg-Klarna.png'

export function KlarnaDesktopPromo() {
  return (
    <div
      className='mt-6 hidden overflow-hidden rounded-[1.25rem] md:block'
      role='complementary'
      aria-label='Klarna betalingsinformasjon'
    >
      <Image
        src={KLARNA_DESKTOP_PROMO_SRC}
        alt='Klarna er nå tilgjengelig'
        width={1024}
        height={768}
        sizes='(min-width: 1024px) 33vw, 100vw'
        className='h-auto w-full'
        quality={95}
      />
    </div>
  )
}
