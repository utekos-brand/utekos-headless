export type Review = {
  id: number
  name: string
  location?: string
  role?: string
  title?: string
  quote: string
  rating: number
  product?: string
}

export const reviews: Review[] = [
  {
    id: 1,
    name: 'Marit, 62',
    location: 'Hemsedal',
    role: 'Hytteeier',
    title: 'Nå er det jeg som sitter lengst',
    product: 'Utekos TechDown',
    quote:
      'Takk til dere. Nå er det jeg som vil sitte lengst ute om kveldene, og terrassen blir brukt mye mer enn før. Umulig å ikke elske dette produktet.',
    rating: 5
  },
  {
    id: 2,
    name: 'Elisabeth, 47',
    location: 'Tjøme',
    role: 'Livsnyter',
    title: 'Nytt yndlingsplagg',
    quote:
      'Genialt! Når man lærer seg å utnytte det eksisterende potensialet, så oppleves mulighetene nesten endeløse. Dette er mitt nye yndlingsplagg.',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 3,
    name: 'Knut-Egil, 58',
    location: 'Viken',
    role: 'Bobileier',
    title: 'Uvurderlig på bobilferie',
    quote:
      'Det beste kjøpet jeg gjorde i fjor. Å ha dette alternativet på bobilferie er faktisk uvurderlig. Anbefales på det varmeste!',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 4,
    name: 'Berit, 64',
    location: 'Narvik',
    title: 'Varm og fornøyd',
    quote: 'Veldig bra',
    rating: 4,
    product: 'Utekos TechDown'
  },
  {
    id: 5,
    name: 'Therese, 49',
    location: 'Narvik',
    title: 'Veldig komfortabel',
    quote:
      'Jeg har ikke prøvd den utendørs enda, men jeg kan nesten ikke vente! Veldig komfortabel å ha på og god passform.',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 6,
    name: 'Richard, 61',
    location: 'Narvik',
    title: 'Glad kone',
    quote: 'Kona ble kjempefornøyd.',
    rating: 4,
    product: 'Utekos TechDown'
  },
  {
    id: 7,
    name: 'Bente, 68',
    location: 'Lillehammer',
    title: 'Kjempegod service',
    quote:
      'Tusen takk for hurtig svar og kjempegod service. Veldig fornøyd med både produktet og opplevelsen.',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 8,
    name: 'Heidi',
    title: 'Utesesongen starter tidligere',
    quote:
      'Veldig fin passform og kvalitet! Blir deilig å ha ute på hytta og gjør at utesesongen på terrassen kan starte enda tidligere. Blir nok kjøpt inn noen flere.',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 9,
    name: 'Knut Arne',
    title: 'Varm fra hode til tå',
    quote:
      'Etter en hyggelig prat med kundeservice fikk vi tilpasset Utekosen perfekt. Varm og god, samtidig som den er veldig lett og heldekkende med hette. Holder deg varm fra hode til tå.',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 10,
    name: 'Mathias',
    title: 'Helt genialt',
    quote:
      'Helt genialt å dra frem i veldig mange situasjoner. Raskt og problemfritt, akkurat som lovet. Anbefales på det sterkeste!',
    rating: 5,
    product: 'Utekos Dun'
  },
  {
    id: 11,
    name: 'Karin',
    title: 'Veldig fornøyd',
    quote: 'Enkelt å bestille, rask levering og flott produkt. Veldig fornøyd med hele kjøpsopplevelsen.',
    rating: 5
  },
  {
    id: 12,
    name: 'Synnøve',
    title: 'Super',
    quote: 'Super utekosdress 🤩',
    product: 'Utekos Mikrofiber',
    rating: 5
  },
  {
    id: 13,
    name: 'Ole Gunnnar',
    title: 'Svarte til forventningene',
    quote:
      'Utekos er prøvd på altan i sur nordaustavind og 4 grader. Den svarte til forventningene. Lurt å lære seg rett bruk av snøring. Den holdt meg varm og god. 🤩',
    product: 'Utekos Mikrofiber',
    rating: 5
  },
  {
    id: 14,
    name: 'Kjetil',
    title: 'Gjør at du ikke trenger å gå',
    quote: 'Veldig kjekk å ha på kalde kvelder, gjør at du ikke trenger å gå pga. at du fryser😊',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 15,
    name: 'Ørjan',
    title: 'Veldig hyggelig og hjelpsom betjening ',
    quote:
      'Veldig behagelig på. Veldig hyggelig og hjelpsom betjening som stilte opp med varene under 24 timer etter bestilling.',
    product: 'Utekos Mikrofiber',
    rating: 5
  },
  {
    id: 16,
    name: 'Synnøve',
    title: 'Super passform',
    quote: 'Super utekosdress 🤩',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 17,
    name: 'Kari',
    title: 'Rask levering',
    quote: 'Enkelt å bestille, rask levering og flott produkt! 😊👍',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 18,
    name: 'Anonym',
    title: 'Kjøpte til min sønn i rullestol',
    quote: 'Jeg kjøpte den til sønnen min som sitter i rullestolen og nå holder han seg godt og varmt 👍',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 19,
    name: 'Monika',
    title: 'Utrolig deilig',
    quote: 'Den var utrolig deilig å ha på ute i sneborgen. Varm og god over hele kroppen.',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 20,
    name: 'Steinar',
    title: 'Kjempeplagg',
    quote: 'Kjæmpeplagg',
    rating: 5,
    product: 'Utekos TechDown'
  },
  {
    id: 21,
    name: 'Gunnar',
    title: 'God støtte på telefon',
    quote: 'God støtte på telefon etter at jeg skrev mail om at jeg hadde gjort feil i bestillingen 🤩',
    rating: 5,
    product: 'Utekos'
  },
  {
    id: 22,
    name: 'Gunnar',
    title: 'Bra produkt',
    quote: 'Bra produkt',
    rating: 4,
    product: 'Utekos TechDown'
  },
  {
    id: 23,
    name: 'Carina',
    title: 'Fantastisk',
    quote: 'Fantastisk 😊',
    rating: 4,
    product: 'Utekos Mikrofiber'
  }
]
