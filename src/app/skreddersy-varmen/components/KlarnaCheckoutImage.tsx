import { cn } from '@/lib/utils/className'

const KLARNA_IMAGE_DESKTOP =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/728x90.png'
const KLARNA_IMAGE_TABLET =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/300x100_e8687c32-1f9f-4e0d-9562-af1d6ad0c939.png'
const KLARNA_IMAGE_MOBILE =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/320x50_0b8b051a-4eab-40b2-9a2c-0c610915afd4.png'

export function KlarnaCheckoutImage({ className }: { className?: string }) {
  return (
    <div className={cn('w-full min-w-0', className)}>
      <img
        src={KLARNA_IMAGE_MOBILE}
        alt='Velg Klarna i kassen'
        width={320}
        height={50}
        className='block h-auto w-full max-w-80 min-[640px]:hidden'
      />
      <img
        src={KLARNA_IMAGE_TABLET}
        alt='Velg Klarna i kassen'
        width={300}
        height={100}
        className='hidden h-auto w-full max-w-75 min-[640px]:block min-[900px]:hidden'
      />
      <img
        src={KLARNA_IMAGE_DESKTOP}
        alt='Velg Klarna i kassen'
        width={728}
        height={90}
        className='hidden h-auto w-full min-[900px]:block'
      />
    </div>
  )
}
