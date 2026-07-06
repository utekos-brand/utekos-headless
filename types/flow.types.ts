export interface NodeData {
  id: string
  type: string
  position: { x: number; y: number }
  data?: {
    icon: string
    text: string
    iconColor?: string
    color?: string
  }
  width: number
  height: number
}
export interface EdgeData {
  id: string
  sourceId: string
  targetId: string
  data: { color: string }
}

export interface CustomerNetworkViewProps {
  nodes: NodeData[]
  edges: EdgeData[]
  centerNode: NodeData | undefined
}
