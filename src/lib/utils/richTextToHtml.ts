// Path: src/lib/utils/richTextToHtml.ts

type RichTextNode = {
  type: string
  value?: string
  children?: RichTextNode[]
}

function processNode(node: RichTextNode): string {
  if (node.type === 'text' && node.value) {
    // Replace newline characters with <br> tags
    return node.value.replace(/\n/g, '<br />')
  }

  const childrenHtml = node.children?.map(processNode).join('') ?? ''

  switch (node.type) {
    case 'root':
      return `<div>${childrenHtml}</div>`
    case 'paragraph':
      return `<p>${childrenHtml}</p>`
    // Add other cases here as needed (e.g., 'heading', 'list', 'list-item')
    default:
      return childrenHtml
  }
}

export function richTextToHtml(richTextObject: unknown): string | null {
  if (
    !richTextObject
    || typeof richTextObject !== 'object'
    || !('type' in richTextObject)
    || richTextObject.type !== 'root'
  ) {
    return null
  }
  return processNode(richTextObject as RichTextNode)
}
