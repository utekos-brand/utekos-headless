import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Route } from 'next'
import { InlineText } from '@/components/typography/TypographyInlineText'

const DiscoverProductButtons = ({
  productModelName,
  productUrl,
  onDiscoverClick
}: {
  productModelName: string
  productUrl: string
  onDiscoverClick: () => void
}) => {
  return (
    <div className='w-full lg:flex-1'>
      <Button
        asChild
        variant='seeProduct'
        className='group font-utekos-text h-16 min-h-16 w-full justify-center rounded-full px-6 py-5 text-lg tracking-[-0.01em] transition-transform hover:scale-105 md:h-14 md:min-h-14 md:py-4'
      >
	        <Link
	          href={productUrl as Route}
	          onClick={onDiscoverClick}
	          data-track='NewProductLaunchDiscoverClick'
          aria-label={`Oppdag ${productModelName}`}
        >
          <InlineText>Oppdag {productModelName}</InlineText>
          <ArrowRight className='ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0' />
        </Link>
      </Button>
    </div>
  )
}

export default DiscoverProductButtons
