// Path: src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Utekos',
    short_name: 'Utekos',
    description:
      'Forleng kveldene på hytten, i bobilen eller på terrassen. Utekos lager komfortplagg av høy kvalitet.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b051d',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}
