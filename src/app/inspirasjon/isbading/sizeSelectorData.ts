import { Move, Maximize, ScanFace } from 'lucide-react'
import type { SizeProfile } from 'types/cart'

export type SizeOptionKey = 'XS' | 'M' | 'XL'

export const SIZE_DATA: Record<SizeOptionKey, SizeProfile> = {
  XS: {
    id: 'XS',
    fullName: 'XS',
    label: 'XS',
    tagline: 'Frihet i bevegelse',
    heightRange: '160 - 170 cm',
    idealFor: ['Høyde opp til 170cm', 'Aktive livsstiler', 'Lettvekts-pakking'],
    icon: Move,
    // imageSrc: '/images/silhouette-active.png',
    visualScale: 0.9,
    benefits: [
      {
        title: 'Active Fit™',
        desc: 'Kortere snitt optimalisert for bevegelse. Gå, løp eller rigg utstyr uten at stoffet kommer i veien.'
      },
      {
        title: 'Flash Heat',
        desc: 'Mindre innvendig volum betyr at kroppsvarmen din fyller kåpen og isolerer deg raskere.'
      }
    ]
  },
  M: {
    id: 'M',
    fullName: 'M',
    label: 'M',
    tagline: 'Den perfekte balansen',
    heightRange: '170 - 180 cm',
    idealFor: ['Høyde 170-180cm', 'Allsidig bruk', 'Komfort og funksjon'],
    icon: ScanFace,
    visualScale: 1.0,
    benefits: [
      {
        title: 'Optimal Passform',
        desc: 'Designet for å gi en ideell balanse mellom bevegelsesfrihet og full dekning for de fleste kroppstyper.'
      },
      {
        title: 'Adaptiv Varme',
        desc: 'Effektiv varmebevaring som tilpasser seg ulike aktivitetsnivåer, fra rolig avslapning til lett aktivitet.'
      }
    ]
  },
  XL: {
    id: 'XL',
    fullName: 'XL',
    label: 'XL',
    tagline: 'Ditt private fristed',
    heightRange: '180 - 190 cm+',
    idealFor: ['Alle over 180cm', 'Isbadere som skifter', 'Maksimal hygge'],
    icon: Maximize,
    visualScale: 1.1,
    benefits: [
      {
        title: 'Mobile Changing Room',
        desc: 'Ekstra plass til å skifte tøy helt privat og uforstyrret'
      },
      {
        title: 'Full Body Shield',
        desc: 'Oversized fit gir beskyttelse helt ned til leggene.'
      }
    ]
  }
}
