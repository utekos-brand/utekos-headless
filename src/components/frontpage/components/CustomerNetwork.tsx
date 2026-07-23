'use client'

import { nodes, nodesDesktop, edges } from './initialElements'
import { CustomerNetworkView } from '../ChatAndInfoSection/CustomerNetworkView'

export function CustomerNetwork() {
  const centerNode = nodes.find(node => node.type === 'center')

  return (
    <CustomerNetworkView
      nodes={nodes}
      nodesDesktop={nodesDesktop}
      edges={edges}
      centerNode={centerNode}
    />
  )
}
