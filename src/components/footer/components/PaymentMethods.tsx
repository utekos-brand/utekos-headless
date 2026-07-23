const PAY_ICONS_MOBILE =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/PayIconsMobile.webp?v=1784837536'
const PAY_ICONS_IPAD =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/PayIconsIpad.webp?v=1784837673'
const PAY_ICONS_DESKTOP =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/FooterPayIcons.webp?v=1784837537'

const ALT =
  'Betalingsmetoder: Klarna, Vipps, Visa og Mastercard'

export function PaymentMethods() {
  return (
    <div className='mt-12 border-t border-border pt-8'>
      <img
        src={PAY_ICONS_MOBILE}
        alt={ALT}
        width={390}
        height={50}
        className='mx-auto block h-auto w-full max-w-5xl md:hidden'
      />
      <img
        src={PAY_ICONS_IPAD}
        alt={ALT}
        width={800}
        height={150}
        className='mx-auto hidden h-auto w-full max-w-5xl md:block lg:hidden'
      />
      <img
        src={PAY_ICONS_DESKTOP}
        alt={ALT}
        width={1200}
        height={180}
        className='mx-auto hidden h-auto w-full max-w-5xl lg:block'
      />
    </div>
  )
}
