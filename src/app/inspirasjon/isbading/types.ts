// Path: src/app/inspirasjon/isbading/types.ts
import type { LucideIcon } from 'lucide-react'

export interface Benefit {
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export interface UseCase {
  icon: LucideIcon
  time: string
  title: string
  description: string
  temperature: string
  color: string
  iconColor: string
}

export interface Destination {
  name: string
  season: string
  highlight: string
  color: string
}
