import { SITE_URL } from '@/constants'

export const COMFYROBE_LANDING_PATH = '/comfyrobe'
export const COMFYROBE_LANDING_URL = `${SITE_URL}${COMFYROBE_LANDING_PATH}`
export const COMFYROBE_PRODUCT_HANDLE = 'comfyrobe'
export const COMFYROBE_PRODUCT_URL = `${SITE_URL}/produkter/${COMFYROBE_PRODUCT_HANDLE}`

export const COMFYROBE_LANDING_NAME =
  'Comfyrobe™ – varm og vanntett allværskåpe | Utekos'

export const COMFYROBE_LANDING_DESCRIPTION =
  'Comfyrobe™ kombinerer et værbeskyttende skall med mykt SherpaCore™-fôr. Velg størrelse og kjøp direkte med Klarna eller legg i handlekurven.'

export const COMFYROBE_LANDING_IMAGE =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-1600x1600.png?v=1784824903'

export const COMFYROBE_LANDING_FAQ = [
  {
    question: 'Er Comfyrobe™ vanntett?',
    answer:
      'Comfyrobe™ har et værbeskyttende skall med 8 000 mm vannsøyle, pustende membran og tapede sømmer. Den er utviklet for regn, vind og skiftende norsk hverdagsvær.'
  },
  {
    question: 'Hvordan er passformen?',
    answer:
      'Passformen er bevisst romslig og unisex, slik at kåpen enkelt kan brukes over vanlige klær eller flere lag. Sidesplitter gir ekstra bevegelsesfrihet.'
  },
  {
    question: 'Hvilken størrelse bør jeg velge?',
    answer:
      'Velg størrelsen du vanligvis bruker, men husk at Comfyrobe™ er laget for å sitte romslig. Se den komplette størrelsesguiden for mål og anbefalinger.'
  },
  {
    question: 'Kan den brukes som vanlig jakke?',
    answer:
      'Ja. Comfyrobe™ er laget for allvær og hverdagsbruk, som hundelufting, hytteterrasse, brygge, camping, sidelinje og raske ærender.'
  },
  {
    question: 'Passer den etter isbading?',
    answer:
      'Ja. Det romslige snittet og det myke fôret gjør den godt egnet etter isbading og andre vannaktiviteter, men siden er først og fremst utviklet rundt bred allværs- og hverdagsbruk.'
  }
] as const
