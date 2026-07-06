import type { LucideIcon } from 'lucide-react'

export interface UseCase {
  icon: LucideIcon
  time: string
  title: string
  description: string
  color: string
  iconColor: string
}

export interface Benefit {
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export interface TerraceIdea {
  name: string
  highlight: string
  icon: LucideIcon
  color: string
}
