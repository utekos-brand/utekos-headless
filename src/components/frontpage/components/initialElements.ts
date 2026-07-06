import { Check, Feather, Heart, Moon } from 'lucide-react'

export type IconName = keyof typeof iconMap

export const iconMap = {
  moon: Moon,
  feather: Feather,
  heart: Heart,
  check: Check
}

const centerX = 260
const centerY = 260
const nodeWidth = 208
const nodeHeight = 54
const centerNodeSize = 112
const offsetX = 228
const offsetY = 198

export const nodes = [
  {
    id: 'center',
    type: 'center',
    position: {
      x: centerX - centerNodeSize / 2,
      y: centerY - centerNodeSize / 2
    },
    width: centerNodeSize,
    height: centerNodeSize
  },
  {
    id: 'benefit-1',
    type: 'benefit',
    position: { x: centerX - offsetX, y: centerY - offsetY },
    width: nodeWidth,
    height: nodeHeight,
    data: {
      icon: 'moon' as IconName,
      text: 'Forlenget kveldene',
      color: 'var(--accent)',
      iconColor: 'var(--foreground)'
    }
  },
  {
    id: 'benefit-2',
    type: 'benefit',
    position: {
      x: centerX + offsetX - nodeWidth,
      y: centerY - offsetY
    },
    width: nodeWidth,
    height: nodeHeight,
    data: {
      icon: 'feather' as IconName,
      text: 'Overraskende lett',
      color: 'var(--accent)',
      iconColor: 'var(--foreground)'
    }
  },
  {
    id: 'benefit-3',
    type: 'benefit',
    position: {
      x: centerX - offsetX,
      y: centerY + offsetY - nodeHeight
    },
    width: nodeWidth,
    height: nodeHeight,
    data: {
      icon: 'heart' as IconName,
      text: 'Gjennomført kvalitet',
      color: 'var(--accent)',
      iconColor: 'var(--foreground)'
    }
  },
  {
    id: 'benefit-4',
    type: 'benefit',
    position: {
      x: centerX + offsetX - nodeWidth,
      y: centerY + offsetY - nodeHeight
    },
    width: nodeWidth,
    height: nodeHeight,
    data: {
      icon: 'check' as IconName,
      text: 'Verdt hver krone',
      color: 'var(--accent)',
      iconColor: 'var(--foreground)'
    }
  }
]

export const edges = [
  {
    id: 'e-center-1',
    sourceId: 'center',
    targetId: 'benefit-1',
    data: { color: 'var(--card-foreground)' }
  },
  {
    id: 'e-center-2',
    sourceId: 'center',
    targetId: 'benefit-2',
    data: { color: 'var(--card-foreground)' }
  },
  {
    id: 'e-center-3',
    sourceId: 'center',
    targetId: 'benefit-3',
    data: { color: 'var(--card-foreground)' }
  },
  {
    id: 'e-center-4',
    sourceId: 'center',
    targetId: 'benefit-4',
    data: { color: 'var(--card-foreground)' }
  }
]
