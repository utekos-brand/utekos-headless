// Path: src/components/renderNode.tsx
import React from 'react'

import type { RenderableNode } from '@types'

/**
 * @fileoverview The workhorse of the rich text rendering system.
 * This module provides a recursive function that traverses a rich text Abstract
 * Syntax Tree (AST) and maps each node to its corresponding React element.
 *
 * @module components/renderNode
 * @see {module:components/RichTextRenderer} for the entry-point component.
 */

/**
 * Recursively renders a single node from a rich text AST into a React element.
 * This function acts as a "switch" that maps a specific node type to JSX.
 *
 * @param {RenderableNode} node - The AST node to be rendered.
 * @param {number} index - The node's index within its parent's children array,
 * crucial for providing a stable React `key`.
 * @returns {React.ReactNode | null} The corresponding React element for the given
 * node, or `null` for any unhandled node types.
 */
export const renderNode = (
  node: RenderableNode,
  index: number
): React.ReactNode => {
  switch (node.type) {
    case 'paragraph':
      // The type assertion `node.children as RenderableNode[]` is necessary here
      // Because TypeScript cannot infer the specific child type within the union.
      return (
        <p key={index}>{(node.children as RenderableNode[]).map(renderNode)}</p>
      )

    case 'list':
      const listItems = (node.children as RenderableNode[]).map(renderNode)
      if (node.listType === 'unordered') {
        return (
          <ul key={index} className='list-disc list-inside space-y-1'>
            {listItems}
          </ul>
        )
      }
      return (
        <ol key={index} className='list-decimal list-inside space-y-1'>
          {listItems}
        </ol>
      )

    case 'list-item':
      return (
        <li key={index}>
          {(node.children as RenderableNode[]).map(renderNode)}
        </li>
      )

    case 'text':
      let textElement: React.ReactNode = node.value
      if (node.bold) {
        textElement = <strong>{textElement}</strong>
      }
      if (node.italic) {
        textElement = <em>{textElement}</em>
      }
      return <React.Fragment key={index}>{textElement}</React.Fragment>

    default:
      return null
  }
}
