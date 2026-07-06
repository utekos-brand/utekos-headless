export type RootChildNode = ParagraphNode | ListNode

export type RenderableNode = ParagraphNode | ListNode | ListItemNode | TextNode

export interface TextNode {
  type: 'text'
  value: string
  bold?: boolean
  italic?: boolean
}

export interface ListItemNode {
  type: 'list-item'
  children: TextNode[]
}

export interface ListNode {
  type: 'list'
  listType: 'ordered' | 'unordered'
  children: ListItemNode[]
}

export interface ParagraphNode {
  type: 'paragraph'
  children: TextNode[]
}

/** The top-level node. */
export interface RootNode {
  type: 'root'
  children: RootChildNode[]
}
