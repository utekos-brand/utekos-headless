// Path: src/app/produkter/(oversikt)/utils/comfyrobeFeatures.ts

import { ShieldCheck, ThermometerSnowflake, Move3d } from 'lucide-react'

export const comfyrobeFeatures = [
  {
    icon: ShieldCheck,
    title: 'Total værbeskyttelse',
    description: '8000 mm vannsøyle og pustende membran (~3000 g/m²/24 t) ',
    surface: 'weather'
  },
  {
    icon: ThermometerSnowflake,
    title: 'Kompromissløs komfort',
    description: 'Mykt SherpaCore™ plysj gir varmeisolering og komfort',
    surface: 'warmth'
  },
  {
    icon: Move3d,
    title: 'Gjennomtenkt frihet',
    description: 'Romslig unisex passform med splitter i sidene og en smart toveis YKK-glidelås®',
    surface: 'freedom'
  }
] as const
