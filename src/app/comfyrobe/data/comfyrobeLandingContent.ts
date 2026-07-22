export type ComfyrobeScenario = {
  id: string
  tabLabel: string
  eyebrow: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  points: readonly string[]
}

export type ComfyrobeTechnicalFeature = {
  value: string
  label: string
  description: string
}

export type ComfyrobeFaq = {
  question: string
  answer: string
}

export const COMFYROBE_SCENARIOS: readonly ComfyrobeScenario[] = [
  {
    id: 'ruskevaer',
    tabLabel: 'Regn og vind',
    eyebrow: 'Når været slår om',
    title: 'La været bli en mindre del av planen',
    description:
      'HydroGuard™-skallet kombinerer 8000 mm vannsøyle, vindtett konstruksjon, pustende PU-belegg og tapede sømmer.',
    imageSrc:
      'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Mann-Regn-Brygge-1080-1350.png',
    imageAlt: 'Mann med Comfyrobe på brygge i regnvær.',
    points: [
      'Skjermer mot regn og vind',
      'Pustende konstruksjon reduserer klamhet',
      'Romslig hette beskytter hode og nakke'
    ]
  },
  {
    id: 'etter-aktivitet',
    tabLabel: 'Etter aktivitet',
    eyebrow: 'Når kroppen trenger varme',
    title: 'Fra aktivitet til komfort uten unødvendig venting',
    description:
      'Det myke SherpaCore™-fôret gir umiddelbar varme og absorberer restfuktighet etter isbad, vannsport eller annen aktivitet.',
    imageSrc:
      'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-Ved-Vannet-1080-1350.png',
    imageAlt: 'Kvinne med Comfyrobe ved vannet.',
    points: [
      '250 GSM teknisk sherpa-fôr',
      'Kan trekkes over våte klær og flere lag',
      'Toveis glidelås gjør temperaturregulering enkel'
    ]
  },
  {
    id: 'camping',
    tabLabel: 'Camping og bobil',
    eyebrow: 'Når kvelden varer litt lenger',
    title: 'Behold varmen rundt bobilen, på hytten og ved bålpannen',
    description:
      'Den avslappede unisex-passformen gir plass til flere lag og gjør Comfyrobe™ enkel å ta på når temperaturen faller.',
    imageSrc: '/comfyrobe/monica-arne-comfy.png',
    imageAlt: 'To personer bruker Comfyrobe utendørs.',
    points: [
      'Romslig passform for avslappet bruk',
      'Fôrede lommer gir hendene rask varme',
      'Splitter i sider og bak gir bevegelsesfrihet'
    ]
  },
  {
    id: 'hverdagsbruk',
    tabLabel: 'Båt og tribune',
    eyebrow: 'Når du blir sittende ute',
    title: 'Komfort for rolige øyeblikk i kjølig vær',
    description:
      'Comfyrobe™ fungerer like godt på båten og tribunen som på terrassen, ved fiskevannet eller på korte ærend i ruskevær.',
    imageSrc:
      'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Front-Open-1080x1350.png',
    imageAlt: 'Comfyrobe i demitasse vist lukket forfra.',
    points: [
      'Rent og tidløst uttrykk',
      'Innerlomme og to fôrede sidelommer',
      'Diskrete refleksdetaljer'
    ]
  }
] as const

export const COMFYROBE_TECHNICAL_FEATURES: readonly ComfyrobeTechnicalFeature[] = [
  {
    value: '8000 mm',
    label: 'HydroGuard™ vannsøyle',
    description:
      'Vanntett ytterstoff med pustende PU-belegg og tapede sømmer.'
  },
  {
    value: '250 GSM',
    label: 'SherpaCore™-fôr',
    description:
      'Mykt, varmt og antipeeling-behandlet teknisk fôr i polyester.'
  },
  {
    value: 'YKK®',
    label: 'Toveis glidelås',
    description:
      'Åpnes fra begge retninger for enklere av- og påkledning og temperaturregulering.'
  },
  {
    value: 'Unisex',
    label: 'Romslig bevegelsesfrihet',
    description:
      'Avslappet snitt med splitter i sidene og bak, utviklet for klær og lag under.'
  }
] as const

export const COMFYROBE_FAQS: readonly ComfyrobeFaq[] = [
  {
    question: 'Er Comfyrobe™ vanntett?',
    answer:
      'Ja. HydroGuard™-ytterstoffet har minimum 8000 mm vannsøyle, pustende PU-belegg og tapede sømmer. Konstruksjonen er utviklet for å holde regn og vind ute uten å bli unødvendig klam.'
  },
  {
    question: 'Er Comfyrobe™ bare laget for isbading?',
    answer:
      'Nei. Isbading er ett av mange bruksområder. Comfyrobe™ er også utviklet for camping, bobil, hytteliv, båt, tribune, fiske, uteaktivitet og hverdagsbruk i kjølig eller vått vær.'
  },
  {
    question: 'Kan den brukes over våte klær og tykke lag?',
    answer:
      'Ja. Passformen er romslig, unisex og avslappet. Den kan trekkes over våte klær og tykke gensere, mens splitter i sidene og bak gir bedre bevegelsesfrihet.'
  },
  {
    question: 'Hvordan velger jeg størrelse?',
    answer:
      'Velg størrelse etter hvor mye plass du ønsker til klær under. Bruk den detaljerte størrelsesguiden for mål og sammenligning før du bestiller.'
  },
  {
    question: 'Hvordan vaskes Comfyrobe™?',
    answer:
      'Vask på skånsomt program ved maksimalt 40 °C med mildt vaskemiddel. Unngå blekemiddel og høy varme. Hengende tørking er anbefalt for å bevare ytterstoff og vanntetthet.'
  },
  {
    question: 'Hvilke betalings- og returløsninger tilbys?',
    answer:
      'Du kan betale trygt med blant annet Vipps, Klarna, Visa, Google Pay og Apple Pay. Utekos tilbyr 14 dagers åpent kjøp; full informasjon finnes på siden for frakt og retur.'
  }
] as const
