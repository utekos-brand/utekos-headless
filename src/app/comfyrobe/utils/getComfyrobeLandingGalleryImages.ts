import { COMFYROBE_PRODUCT_GALLERY_IMAGES } from '@/app/produkter/[handle]/utils/gallery-images/comfyrobeProductGalleryImages'
import type { Image } from 'types/media'

const COMFYROBE_LANDING_GALLERY_ORDER = [
  'comfyrobe-sherpa-open',
  'comfyrobe-demitasse-open-front',
  'comfyrobe-mann-regn-brygge',
  'comfyrobe-sherpa',
  'comfyrobe-closed-front',
  'comfyrobe-back'
] as const

export function getComfyrobeLandingGalleryImages(): Image[] {
  const imagesById = new Map(
    COMFYROBE_PRODUCT_GALLERY_IMAGES.map(image => [image.id, image])
  )

  return COMFYROBE_LANDING_GALLERY_ORDER.flatMap(imageId => {
    const image = imagesById.get(imageId)
    return image ? [image] : []
  })
}
