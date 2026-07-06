import type { Image } from 'types/media'

export const STOCK_THRESHOLD = 31

export function resolveProductGalleryImages(
  overrideImages: Image[] | undefined,
  fallbackImages: Image[]
): Image[] {
  return overrideImages ?? fallbackImages
}
