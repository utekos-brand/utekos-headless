export function getTextFromLegacyContent(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map(part => {
      if (
        typeof part === 'object'
        && part !== null
        && 'type' in part
        && part.type === 'text'
        && 'text' in part
        && typeof part.text === 'string'
      ) {
        return part.text
      }

      return ''
    })
    .filter(Boolean)
    .join('')
}
