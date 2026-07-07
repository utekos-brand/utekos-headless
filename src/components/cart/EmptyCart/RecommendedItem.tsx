import { getInitialAvailableOptions } from '@/components/ProductCard/getInitialAvailableOptions'
import { findMatchingVariant } from '@/components/ProductCard/findMatchingVariant'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { cartStore } from '@/lib/state/cartStore'
import { formatPrice } from '@/lib/utils/formatPrice'
import type { ShopifyProduct } from 'types/product'
import Image from 'next/image'
import Link from 'next/link'

export function RecommendedItem({
  product
}: {
  product: ShopifyProduct
}) {
  const cartActor = CartMutationContext.useActorRef()
  const selectedOptions = getInitialAvailableOptions(product)
  const selectedVariant = findMatchingVariant(
    product,
    selectedOptions
  )

  const handleAddToCart = () => {
    if (selectedVariant) {
      cartActor.send({
        type: 'ADD_LINES',
        input: [{ variantId: selectedVariant.id, quantity: 1 }]
      })
    }
  }

  return (
    <div className='flex items-center gap-4'>
      <Link
        href={`/produkter/${product.handle}`}
        onClick={() => cartStore.send({ type: 'CLOSE' })}
      >
        <div className='w-16 shrink-0'>
          <AspectRatio
            ratio={2 / 3}
            className='overflow-hidden rounded-md border border-border bg-muted'
          >
            {product.featuredImage && (
              <Image
                src={product.featuredImage.url}
                alt={
                  product.featuredImage.altText || product.title
                }
                fill
                className='object-cover'
                sizes='64px'
              />
            )}
          </AspectRatio>
        </div>
      </Link>
      <div className='grow'>
        <Link
          href={`/produkter/${product.handle}`}
          onClick={() => cartStore.send({ type: 'CLOSE' })}
        >
          <h4 className='text-sm font-medium text-foreground hover:underline'>
            {product.title}
          </h4>
        </Link>
        <p className='mt-1 text-sm text-foreground/90'>
          {formatPrice(product.priceRange.minVariantPrice)}
        </p>
      </div>
      <Button
        size='sm'
        variant='secondary'
        onClick={handleAddToCart}
        disabled={!selectedVariant}
      >
        Legg til
      </Button>
    </div>
  )
}
