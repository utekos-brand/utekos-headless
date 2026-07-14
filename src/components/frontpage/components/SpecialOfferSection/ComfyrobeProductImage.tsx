import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'
import type { ShopifyMediaImage } from 'types/media'

type ComfyrobeProductImageProps = {
  image: ShopifyMediaImage
}

export function ComfyrobeProductImage({ image }: ComfyrobeProductImageProps) {
  return (
    <AspectRatio
      ratio={1 / 1}
      className='bg-transparent lg:h-full lg:aspect-auto!'
    >
      <Image
        src={image.image.url}
        alt={image.image.altText || 'Comfyrobe™ - Vanntett og vindtett robe'}
        height={image.image.height}
        width={image.image.width}
        className='size-full object-cover brightness-90 transition-transform duration-500 hover:scale-105'
        sizes='(max-width: 1024px) 80vw, 40vw'
        quality={95}
        priority
      />
    </AspectRatio>
  )
}
