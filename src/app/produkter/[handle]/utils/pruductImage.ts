import type { Image } from 'types/media'

export function productImage(id: string, url: string, altText: string, width: number, height: number): Image {
  return {
    id,
    url,
    altText,
    width,
    height
  }
}
