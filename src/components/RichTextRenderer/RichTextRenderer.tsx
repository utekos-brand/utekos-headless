// Path: src/components/RichTextRenderer.tsx

'use client'

/**
 * @fileoverview The main entry-point for the rich text rendering system.
 * This module exports a React component that takes a complete rich text AST
 * and renders it into a React tree.
 *
 * @module components/RichTextRenderer
 */

import React from 'react'
import { renderNode } from './helpers/renderNode'

import type { RenderableNode, RichTextRendererProps } from '@types'

export function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content?.children?.length) {
    return null
  }

  return (
    <>
      {content.children.map(
        renderNode as (node: RenderableNode, index: number) => React.ReactNode
      )}
    </>
  )
}
