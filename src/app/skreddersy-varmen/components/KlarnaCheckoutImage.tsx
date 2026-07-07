import Image from 'next/image'
import { cn } from '@/lib/utils/className'

export function KlarnaCheckoutImage({ className }: { className?: string }) {
  return (
    <Image
      src='/klarna/pay-with-klarna/728x90Center.png'
      alt='Velg Klarna i kassen'
      width={728}
      height={90}
      className={cn(
        'ml-auto block h-auto w-full max-w-[20rem] sm:max-w-md min-[1536px]:max-w-120',
        className
      )}
    />
  )
}
