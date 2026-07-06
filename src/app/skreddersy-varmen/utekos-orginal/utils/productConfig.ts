// Path: src/app/skreddersy-varmen/utekos-orginal/utils/productConfig.ts

export const productConfig = {
  price: 1590,
  colors: [
    {
      id: 'vargnatt',
      name: 'Vargnatt (Sort)',
      hex: '#000000',

      image: '/classic-black-jacket-3-4.png'
    },
    {
      id: 'fjellbla',
      name: 'Fjellblå',
      hex: '#020244',

      image: '/1080/blue-full.png'
    }
  ],
  sizes: [
    { id: 'medium', name: 'Medium', desc: 'Passer de fleste opp til 175cm' },
    {
      id: 'large',
      name: 'Large',
      desc: 'For deg som vil ha ekstra romslighet (175cm+)'
    }
  ]
} as const
