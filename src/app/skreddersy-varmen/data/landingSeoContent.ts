// Path: src/app/skreddersy-varmen/data/landingSeoContent.ts
import type { Route } from 'next'

export const LANDING_BASE_URL = 'https://utekos.no'
export const LANDING_PAGE_URL = `${LANDING_BASE_URL}/skreddersy-varmen`
export const LANDING_LAST_UPDATED = '2026-05-22'
export const LANDING_AUTHOR_NAME = 'Utekos'

export type LandingProductSeed = {
  position: number
  handle: string
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  sku: string
}

export type LandingFaqEntry = {
  question: string
  answer: string
}

export type LandingEvidenceEntry = {
  title: string
  answer: string
  href: Route
  linkLabel: string
}

export const LANDING_PRODUCTS: LandingProductSeed[] = [
  {
    position: 1,
    handle: 'utekos-techdown',
    name: 'Utekos TechDown™',
    description:
      'Flaggskipet i kolleksjonen. Hydrofob CloudWave™-isolasjon beholder varmen i fukt, og 3-i-1-konstruksjonen lar deg justere fra parkas til kokong på sekunder.',
    price: '1790',
    originalPrice: '1990',
    image: `${LANDING_BASE_URL}/utekos-techdown-kvinne-terrasseliv-1600x1600.webp`,
    sku: 'utekos-techdown'
  },
  {
    position: 2,
    handle: 'utekos-mikrofiber',
    name: 'Utekos Mikrofiber™',
    description:
      'Det lette og pakkbare valget for bobil, båt, hytte og reise. Mikrofiber™ gir lun varme med lavt volum og enkel tørk.',
    price: '1590',
    originalPrice: '2290',
    image: `${LANDING_BASE_URL}/1080/blue-full.png`,
    sku: 'utekos-mikrofiber'
  }
]

export const LANDING_EVIDENCE_ENTRIES: LandingEvidenceEntry[] = [
  {
    title: '3-i-1 gir kontroll over varmen',
    answer:
      'Utekos kan brukes som parkas, oppfestet modell eller kokong. Det gjør at samme plagg fungerer når du sitter lenge ute, går en kort tur eller vil pakke bena helt inn.',
    href: '/handlehjelp/funksjonalitet' as Route,
    linkLabel: 'Se funksjonalitet'
  },
  {
    title: 'Syntetisk isolasjon tåler rå luft',
    answer:
      'TechDown™ bruker hydrofob CloudWave™-isolasjon som holder loft og varme bedre i fukt enn klassisk dun. Det er relevant i norsk kystklima og ved bålpanne, båt og bobil.',
    href: '/handlehjelp/teknologi-materialer' as Route,
    linkLabel: 'Se teknologi'
  },
  {
    title: 'Størrelse velges etter høyde og ønsket rom',
    answer:
      'Velg størrelse ut fra høyde, lag under og hvor lun kokongfølelse du ønsker. Størrelsesguiden forklarer forskjellen mellom Liten, Middels, Stor og Ekstra stor.',
    href: '/handlehjelp/storrelsesguide' as Route,
    linkLabel: 'Se størrelsesguide'
  },
  {
    title: 'Trygg kjøpsramme',
    answer:
      'Utekos sendes normalt innen 2-5 virkedager i Norge. Du har 14 dagers returfrist, og frakt- og returvilkår er samlet på en egen hjelpeside.',
    href: '/frakt-og-retur' as Route,
    linkLabel: 'Se frakt og retur'
  }
]

export const LANDING_FAQ_ENTRIES: LandingFaqEntry[] = [
  {
    question: 'Hvilken Utekos-modell passer best for meg?',
    answer:
      'Velg TechDown™ når du vil ha mest allsidighet og best fuktytelse. Velg Mikrofiber™ når lav vekt, enkel pakking og rask tørk er viktigst.'
  },
  {
    question: 'Hvordan fungerer 3-i-1-konstruksjonen?',
    answer:
      'Du kan bruke plagget som parkas, feste det opp for mer bevegelse eller stramme det rundt bena som en lun kokong. Poenget er å justere varmen uten å gå inn og skifte.'
  },
  {
    question: 'Fungerer Utekos i fuktig vær?',
    answer:
      'Ja. TechDown™ bruker hydrofob CloudWave™-isolasjon som er laget for å beholde varmeevne når luften er rå eller plagget utsettes for fukt.'
  },
  {
    question: 'Hvordan finner jeg riktig størrelse?',
    answer:
      'Start med høyden din og vurder hvor romslig du vil ha plagget. Bruk størrelsesguiden hvis du ligger mellom to størrelser eller vil ha ekstra plass til lag under.'
  },
  {
    question: 'Hvordan vasker jeg Utekos?',
    answer:
      'Vask skånsomt på maks 30 °C med mild såpe. La plagget lufttørke, og unngå stryking, blekemiddel og hard varme.'
  },
  {
    question: 'Hvor lang er leveringstiden?',
    answer:
      'Normal leveringstid i Norge er 2-5 virkedager. Varer sendes samme dag når ordre og lagerstatus tillater det.'
  },
  {
    question: 'Hvor lang returfrist har jeg?',
    answer:
      'Du har 14 dagers returfrist. Varen må være ubrukt, og frakt- og returvilkår står samlet på frakt- og retursiden.'
  }
]
