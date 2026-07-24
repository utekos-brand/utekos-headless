export type ComfyrobePurchaseGallerySlide = {
  id: string
  alt: string
  squareSrc: string
  /** Portrait crop preferred between iPad and desktop breakpoints. */
  ipadSrc: string
  /** How the image should fill the slide frame. */
  fit?: 'cover' | 'contain'
}

export const COMFYROBE_PURCHASE_PRIMARY_IMAGE =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-1600x1600.png?v=1784824903'

const COMFY_VERT_7 =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfy-Vert7.webp?v=1784870006'

const COMFY_VERT_9 =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfy-Vert9.webp?v=1784870740'

export const COMFYROBE_PURCHASE_GALLERY: readonly ComfyrobePurchaseGallerySlide[] =
  [
    {
      id: 'kvinne',
      alt: 'Kvinne med Comfyrobe™ i studio',
      squareSrc: COMFYROBE_PURCHASE_PRIMARY_IMAGE,
      // Explicit iPad request: keep the square hero still as primary purchase image.
      ipadSrc: COMFYROBE_PURCHASE_PRIMARY_IMAGE
    },
    {
      id: 'herre',
      alt: 'Mann med Comfyrobe™ i studio',
      squareSrc:
        'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/ComfyrobeHerre-1600x1600.webp?v=1784823679',
      ipadSrc:
        'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/ComfyHerre-1080x1350.webp?v=1784823803'
    },
    {
      id: 'kvinne-2',
      alt: 'Comfyrobe™ vist forfra i studio',
      squareSrc:
        'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe2-1600x1600.webp?v=1784823679',
      ipadSrc:
        'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/ComfyKvinne2-1080x1350_40291385-fdab-4435-bdca-9d99f4bb1c1e.webp?v=1784824050'
    },
    {
      id: 'front',
      alt: 'Comfyrobe™ forfra med SherpaCore™-hette',
      squareSrc: COMFY_VERT_9,
      ipadSrc: COMFY_VERT_9,
      fit: 'contain'
    },
    {
      id: 'back',
      alt: 'Comfyrobe™ sett bakfra',
      squareSrc: COMFY_VERT_7,
      ipadSrc: COMFY_VERT_7,
      fit: 'contain'
    }
  ] as const
