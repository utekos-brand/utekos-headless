// Path: src/app/skreddersy-varmen/utekos-orginal/utils/modes.ts

import { ArrowUpToLine, LayoutDashboard, Shield, type LucideIcon } from 'lucide-react'
import type { Mode } from '@types'

export const modes: {
  id: Mode
  title: string
  desc: string
  icon: LucideIcon
  mobileSrc: string // 3:4 format (f.eks 1080x1440)
  desktopSrc: string // 16:9 format (f.eks 1920x1080)
}[] = [
  {
    id: 'parkas',
    title: 'Parkas',
    desc: 'Klassisk passform for bevegelse og aktivitet.',
    icon: LayoutDashboard,
    mobileSrc: '/classic-blue-parkas-3-4.png',
    desktopSrc: '/1080/aspect-video-parkas.png'
  },
  {
    id: 'oppfestet',
    title: 'Oppfestet',
    desc: 'Maksimal mobilitet rundt leirplassen.',
    icon: ArrowUpToLine,
    mobileSrc: '/classic-blue-jacket-3-4.png',
    desktopSrc: '/1080/aspect-video-jacket.png'
  },
  {
    id: 'fulldekket',
    title: 'Kokong',
    desc: 'Total isolasjon fra topp til tå for rolig hygge.',
    icon: Shield,
    mobileSrc: '/classic-blue-full-3-4.png',
    desktopSrc: '/1080/aspect-video-kokong-2.webp'
  }
]
