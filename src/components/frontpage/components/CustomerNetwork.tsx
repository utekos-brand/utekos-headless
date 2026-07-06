'use client'

import { nodes, edges } from './initialElements'
import { CustomerNetworkView } from '../ChatAndInfoSection/CustomerNetworkView'

export function CustomerNetwork() {
  const centerNode = nodes.find(node => node.type === 'center')

  return <CustomerNetworkView nodes={nodes} edges={edges} centerNode={centerNode} />
}
