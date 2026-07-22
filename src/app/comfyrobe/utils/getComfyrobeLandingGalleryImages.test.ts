import assert from 'node:assert/strict'
import test from 'node:test'
import { COMFYROBE_PRODUCT_GALLERY_IMAGES } from '@/app/produkter/[handle]/utils/gallery-images/comfyrobeProductGalleryImages'
import { getComfyrobeLandingGalleryImages } from './getComfyrobeLandingGalleryImages'

test('starts with a usage image followed by a clear product image', () => {
  const images = getComfyrobeLandingGalleryImages()

  assert.equal(images[0]?.id, 'comfyrobe-sherpa-open')
  assert.equal(images[1]?.id, 'comfyrobe-demitasse-open-front')
})

test('returns every Comfyrobe gallery image exactly once', () => {
  const images = getComfyrobeLandingGalleryImages()
  const uniqueIds = new Set(images.map(image => image.id))

  assert.equal(images.length, COMFYROBE_PRODUCT_GALLERY_IMAGES.length)
  assert.equal(uniqueIds.size, images.length)
})
