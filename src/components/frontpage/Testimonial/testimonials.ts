// Path: src/data/testimonials.ts

export interface Testimonial {
  quote: string
  name: string
  rating: number
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'Veldig fin passform og kvalitet! Blir deilig å ha ute på hytta og gjør at utesesongen på terrassen kan starte enda tidligere! Blir nok kjøpt inn noen flere.',
    name: 'Heidi',
    rating: 5
  },
  {
    quote:
      'Etter en hyggelig prat med kundeservice fikk vi tilpasset Utekosen perfekt. Varm og god, samtidig som den er veldig lett og heldekkende med hette. Holder deg varm fra hode til tå.',
    name: 'Knut Arne N.',
    rating: 5
  },
  {
    quote:
      'Helt genialt å dra frem i veldig mange situasjoner. Raskt og problemfritt, akkurat som lovet. Anbefales på det sterkeste!',
    name: 'Mathias',
    rating: 5
  },
  {
    quote:
      'Enkelt å bestille, rask levering og flott produkt! Veldig fornøyd med hele kjøpsopplevelsen. 😊👍',
    name: 'Karin H.',
    rating: 5
  },
  {
    quote: 'Kona ble kjempefornøyd! Enkel handel og rask levering.',
    name: 'Richard R.',
    rating: 4.5
  },
  {
    quote:
      'Super utekosdress 🤩 Helt fin passform og fulgte med dunkåpen jeg bestilte.',
    name: 'Synnøve K.',
    rating: 5
  }
]
