// Path: src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Utekos',
    short_name: 'Utekos',
    description:
      'Utekos er en norsk merkevare som designer funksjonelt yttertøy for kompromissløs komfort og overlegen allsidighet. Perfekt for hytteliv, bobilferie, telttur, i båt og terrasseliv.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#001212',
    theme_color: '#0a3c3c',
    categories: ['shopping', 'lifestyle', 'travel'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Utekos TechDown',
        short_name: 'Utekos TechDown',
        description: 'Kjøp Utekos TechDown',
        url: '/produkter/utekos-techdown'
      },
      {
        name: 'Se produkter',
        short_name: 'Produkter',
        description: 'Gå direkte til Utekos-produkter.',
        url: '/produkter'
      },
      {
        name: 'Gaveguide',
        short_name: 'Gaveguide',
        description: 'Finn Utekos som gave.',
        url: '/gaveguide'
      },
      {
        name: 'Størrelsesguide',
        short_name: 'Størrelse',
        description: 'Finn riktig størrelse.',
        url: '/handlehjelp/storrelsesguide'
      },
      {
        name: 'Kundeservice',
        short_name: 'Kundeservice',
        description: 'Kontakt Utekos',
        url: '/kontaktskjema'
      },
      {
        name: 'Skreddersy varmen',
        short_name: 'Varmen',
        description: 'Utforsk valg for varme og komfort.',
        url: '/skreddersy-varmen'
      }
    ]
  }
}