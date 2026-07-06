// Path: src/components/ComfyrobeSection/ComfyrobeImageSection.tsx

'use client'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils/className'
import type { ShopifyMediaImage } from 'types/media'
import { ComfyrobeProductImage } from './ComfyrobeProductImage'

type ComfyrobeImageSectionProps = {
  image: ShopifyMediaImage
}

export function ComfyrobeImageSection({ image }: ComfyrobeImageSectionProps) {
  const [ref, isInView] = useInView({ threshold: 0.5 })
  return (
    <div ref={ref} className={cn('will-animate-fade-in-scale relative', isInView && 'is-in-view')}>
      <Carousel className='w-full overflow-hidden rounded-2xl'>
        <CarouselContent>
          <CarouselItem>
            <ComfyrobeProductImage image={image} />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  )
}
