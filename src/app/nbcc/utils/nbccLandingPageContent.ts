import type { Route } from 'next'

import type {
  NbccFaqItem,
  NbccHeroTracking,
  NbccProduct,
  NbccStep,
  NbccTrackingData,
  NbccUseCase
} from '../types'

export const nbccHeroTracking = {
  primary: {
    page: 'nbcc',
    section: 'hero',
    target: 'products'
  },
  secondary: {
    page: 'nbcc',
    section: 'hero',
    target: 'how-to-use'
  }
} satisfies NbccHeroTracking

export const nbccProducts = [
  {
    title: 'Utekos TechDown™',
    shortTitle: 'TechDown',
    description:
      'Vår nyeste og mest allsidige modell. Nyskapende innerfor som gir en følelse av dun og opprettholder spenstegenenskapene ved fukt.',
    bestFor: 'For bobil, campingvogn, fortelt og faste plasser.',
    images: [
      {
        src: '/utekos-techdown-kvinne-terrasseliv-1600x1600.webp',
        alt: 'Kvinne nyter terrasselivet med Utekos TechDown™'
      },
      {
        src: '/webp/techdown-monica-1080.webp',
        alt: 'Utekos TechDown – modell Monica'
      },
      {
        src: '/utekos-techdown-diagonalt-fullfigur.webp',
        alt: 'Utekos TechDown komfortplagg for kjølige kvelder ute'
      },
      {
        src: '/1080/utekos-techdown-bakside.webp',
        alt: 'Utekos TechDown sett bakfra'
      }
    ],
    href: '/produkter/utekos-techdown' as Route,
    handle: 'utekos-techdown',
    sizes: ['Middels', 'Stor', 'Ekstra Stor'],
    tracking: {
      page: 'nbcc',
      section: 'products',
      product: 'utekos-techdown'
    }
  },
  {
    title: 'Utekos Mikrofiber™',
    shortTitle: 'Mikrofiber',
    description:
      'Lett, praktisk og enkel å pakke med når du vil ha et varmt lag klart ved stolen eller markisen.',
    bestFor: 'For sommerhalvåret, reisedager og raske turer ut.',
    images: [
      { src: '/katelinn.png', alt: 'Utekos Mikrofiber™ – modell Katelinn' },
      { src: '/schema-bilder/utekos-dun.png', alt: 'Utekos Dun produktbilde' },
      {
        src: '/magasinet/dun-front-hvit-bakgrunn-1080.png',
        alt: 'Utekos Dun forfra på hvit bakgrunn'
      },
      {
        src: '/1080/classic-black-1080.png',
        alt: 'Utekos Mikrofiber i sort, lett komfortplagg for campingbruk'
      }
    ],
    href: '/produkter/utekos-mikrofiber' as Route,
    handle: 'utekos-mikrofiber',
    sizes: ['Medium', 'Large'],
    color: 'Fjellblå',
    tracking: {
      page: 'nbcc',
      section: 'products',
      product: 'utekos-mikrofiber'
    }
  },
  {
    title: 'Comfyrobe™',
    shortTitle: 'Comfyrobe™',
    description: 'Vindtett, 8000 vannsøyle og lun etter dusj, bad eller en våt runde over campingplassen.',
    bestFor: 'Som en  fuktige morgener.',
    images: [
      {
        src: '/1080/comfy-1080.png',
        alt: 'Comfyrobe fra Utekos, varm og vanntett skifterobe'
      },
      { src: '/1080/comfy-open-1080.png', alt: 'Comfyrobe åpen fremvisning' },
      { src: '/1080/comfy-design-1080.png', alt: 'Comfyrobe designdetaljer' },
      { src: '/1080/comfy-back-1080.png', alt: 'Comfyrobe sett bakfra' }
    ],
    href: '/produkter/comfyrobe' as Route,
    handle: 'comfyrobe',
    sizes: ['S', 'L'],
    tracking: {
      page: 'nbcc',
      section: 'products',
      product: 'comfyrobe'
    }
  }
] satisfies NbccProduct[]

export const nbccUseCases = [
  {
    title: 'Utenfor bobilen',
    description:
      'Ta steget ut og nyt morgenkaffen i duggfrisk luft, uten å måtte lete frem ekstra klær i halvmørket, mens du gnir søvnen ut av øynene.'
  },
  {
    title: 'Skumringstimen',
    description:
      'Når campingbordet er slått ut og scenen er satt, men den varme ettermiddagen glir på kjent norsk vis brått over til en kjølig kveld.'
  },
  {
    title: 'Ved campingvognen',
    description:
      'Forvandler konseptet "nå må vi snart bevege oss inn, det begynner å bli kaldt" om til en gradvis utfasende myte.'
  },
  {
    title: 'Spontane nabobesøk',
    description:
      'Når campingnaboen stikker innom på et spontant besøk, og du vil skape en lun og gjestfri atmosfære der ingen begynner å fryse.'
  },
  {
    title: 'På treff og tur',
    description:
      'En skreddersydd løsning for alle de sosiale opplevelsene man skal ha rundt campingbordet med gjengen, og alt det i mellom.'
  },
  {
    title: 'På fastplassen og hjemme',
    description:
      'Fremtrer med sin aktualitet fastplassen, men også når du er på hytten, i båten eller bare skal rett ut på terrassen hjemme.'
  }
] satisfies NbccUseCase[]

export const nbccSteps = [
  {
    title: 'Finn fordelen hos NBCC',
    description: 'Som medlem finner du fordelskoden i Min Side / Gnist under medlemsfordeler.'
  },
  {
    title: 'Velg produktene hos Utekos',
    description: 'Velg mellom TechDown, Mikrofiber og Comfyrobe, og legg i handlekurven'
  },
  {
    title: 'Bruk fordelen i kassen',
    description:
      'Når du har funnet det du ønsker deg, legger du bare inn koden i kassen. Da oppdateres prisen til din unike medlemspris helt automatisk.'
  }
] satisfies NbccStep[]

export const nbccFaqItems = [
  {
    question: 'Hvor finner jeg fordelskoden?',
    answer:
      'Som NBCC-medlem finner du den unike rabattkoden din i Gnist-appen, eller ved å logge inn på "Min Side" på www.nbocc.no under medlemsfordeler. Koden legger du enkelt inn i kassen her hos oss, så trekkes rabatten automatisk.'
  },
  {
    question: 'Kan plagget brukes av både kvinner og menn?',
    answer:
      'Ja, Utekos er designet som et unisex-plagg. Se gjerne størrelsesguiden vår for å finne ut hva som passer deg best!'
  },
  {
    question: 'Hvilket Utekos-produkt passer best på camping?',
    answer:
      'Det avhenger litt av dine behov. TechDown er vår varmeste og mest fleksible modell, perfekt for kjølige kvelder under markisen. Mikrofiber er litt lettere og utrolig praktisk å pakke med seg på tur. Er du ute etter vind- og vanntett beskyttelse til ruskeværsdager eller etter kveldsbadet, er Comfyrobe et utmerket valg.'
  },
  {
    question: 'Kan jeg bruke Utekos i forteltet?',
    answer:
      'Ja, helt klart! Utekos er skapt for nettopp å gi komfort og varme i utendørs omgivelser. Å sitte i forteltet med gode venner når kveldskulden smyger seg på, er kanskje den aller beste anledningen til å finne frem Utekos. Det gir den deilige, lune varmen som gjør at dere kan bli sittende ute mye lenger.'
  },
  {
    question: 'Hva hvis størrelsen ikke passer?',
    answer:
      'Det er ingen fare. Du kan besøke vår størrelsesguide via lenken før du bestiller, for å finne din perfekte passform. Skulle uhellet likevel være ute, har du selvfølgelig 14 dagers full retur- og bytterett, slik at du raskt og enkelt kan bytte til en størrelse som sitter perfekt.'
  }
] satisfies NbccFaqItem[]

export const nbccFinalCtaTracking = {
  page: 'nbcc',
  section: 'final-cta',
  target: 'products'
} satisfies NbccTrackingData
