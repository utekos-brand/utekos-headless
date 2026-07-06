import { cn } from '@/lib/utils/className'

export function KlarnaCheckoutImage({ className }: { className?: string }) {
  return (
    <picture className={cn('block min-w-0 justify-self-end', className)}>
      <source
        media='(min-width: 1536px)'
        srcSet='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/970x90-Left.png?v=1780686568'
      />
      <source
        media='(min-width: 900px)'
        srcSet='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/970x90_-_Left.png?v=1780686496'
      />
      <source media='(min-width: 640px)' srcSet='/klarna/pay-with-klarna/white-secondary/728x90-Center.png' />
      <img
        src='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/320x50_cabfde75-63d1-4988-a8b4-af298c897004.png?v=1780686546'
        alt='Velg Klarna i kassen'
        width={320}
        height={50}
        className='ml-auto block h-auto w-full max-w-[20rem] sm:max-w-md min-[1536px]:max-w-120'
      />
    </picture>
  )
}
