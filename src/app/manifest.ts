// Path: src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Utekos',
    short_name: 'Utekos',
    description:
    'Utekos er en norsk merkevare som designer funksjonelt yttertøy for kompromissløs komfort og overlegen allsidighet. Perfekt for hytteliv, bobilferie, telttur, i båt og terrasseliv.',
    start_url: '/',
    display: 'standalone',
    background_color: '#001212',
    theme_color: '#0a3c3c',
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
