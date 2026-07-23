'use client'

import { KlarnaProductExpressCheckout } from '@/components/klarna/components/KlarnaProductExpressCheckout'
import { cn } from '@/lib/utils/className'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

const DiscoverProductButtons = ({
  product,
  selectedVariant
}: {
  product: ShopifyProduct
  selectedVariant: ShopifyProductVariant | null
}) => {
  return (
    <div
      className='flex h-16 min-h-16 w-full items-stretch lg:flex-1 md:h-14 md:min-h-14'
      aria-label='Klarna express checkout'
    >
      <KlarnaProductExpressCheckout
        product={product}
        selectedVariant={selectedVariant}
        quantity={1}
        className='flex h-full min-h-0 w-full min-w-0 items-stretch'
        buttonContainerClassName={cn(
          'h-full min-h-full',
          'md:h-full md:min-h-full'
        )}
      />
    </div>
  )
}

export default DiscoverProductButtons
