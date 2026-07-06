// Path: src/app/produkter/(oversikt)/utils/choices.ts

import type { Route } from 'next'
interface ProductChoice {
  title: string
  description: string
  href: Route
  imageUrl: string
  linkColor: string
}
export const choices: ProductChoice[] = [
  {
    title: 'Utekos TechDown™',
    description:
      'Optimalisert etter erfaringer og tilbakemeldinger. Gir maksimal komfort og bevegelsesfrihet. Perfekt for hytteliv, bobil og all utekos.',
    href: '/produkter/utekos-techdown' as Route,
    imageUrl: '/utekos-techdown-diagonalt-fullfigur.webp',
    linkColor: 'text-sky-800'
  },
  {
    title: 'Utekos Dun™',
    description:
      'Vårt bestselgende isolasjonsplagg, fylt med kvalitetsdun for funksjonell varme på de kaldeste dagene.',
    href: '/produkter/utekos-dun' as Route,
    imageUrl: '/1080/classic-blue-1080.png',
    linkColor: 'text-sky-800'
  },
  {
    title: 'Utekos Mikrofiber™',
    description:
      'Din lette og pålitelige følgesvenn for alt fra bynære turer til kjølige kvelder på terrassen. Enkel, funksjonell og alltid klar.',
    href: '/produkter/utekos-mikrofiber' as Route,
    imageUrl: '/1080/classic-black-1080.png',
    linkColor: 'text-sky-800'
  },
  {
    title: 'Comfyrobe™',
    description:
      'Vanntett, vindtett og fôret med myk plysj. Holder deg garantert varm og tørr etter isbadet eller på en fuktig dag på campingen.',
    href: '/produkter/comfyrobe' as Route,
    imageUrl: '/1080/comfy-1080.png',
    linkColor: 'text-sky-800'
  }
]
